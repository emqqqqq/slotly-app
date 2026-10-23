const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_MODEL = "gemini-3.6-flash";

Deno.serve(async (req: Request) => {
    const json = (data: unknown, status = 200) =>
        new Response(JSON.stringify(data), {
            status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
    }

    try {
        const apiKey = Deno.env.get("GEMINI_API_KEY");

        if (!apiKey) {
            return json({ error: "AI service is not configured" }, 500);
        }

        const body = await req.json();

        const name = String(body.name ?? "").trim().slice(0, 100);
        const date = String(body.date ?? "").trim();
        const startTime = String(body.startTime ?? "").trim();
        const duration = Number(body.durationMinutes);

        if (
            !name ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime) ||
            !Number.isInteger(duration) ||
            duration < 5 ||
            duration > 480
        ) {
            return json({ error: "Invalid booking details" }, 400);
        }

        const prompt =
            `Write a beautiful, warm, personal booking confirmation for ${name}. ` +
            `The appointment is on ${date} at ${startTime} and lasts ${duration} minutes. ` +
            "Make the message feel thoughtful, cheerful, and human, not like a boring automated notification. " +
            "Start with a friendly greeting using the person's name. " +
            "Celebrate that the booking is confirmed, mention the date and time naturally, " +
            "and finish with a kind, welcoming sentence. " +
            "Write 3 to 4 complete sentences and use at most one suitable emoji. " +
            "Use only the details provided. Do not invent a location, purpose, or other information. " +
            "Do not claim that an email was sent. Return only the finished message.";

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey,
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [
                            {
                                text:
                                    "You are a friendly professional assistant who writes polished, " +
                                    "personalized appointment confirmations. Always write complete sentences. " +
                                    "Never return a greeting alone or an unfinished message.",
                            },
                        ],
                    },
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 1024,
                        thinkingConfig: { thinkingLevel: "minimal" },
                    },
                }),
                signal: AbortSignal.timeout(8000),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();

            console.error("Gemini API error:", response.status, errorText);

            return json(
                {
                    error:
                        response.status === 429
                            ? "AI quota exceeded. Please try again later."
                            : "Could not generate the AI confirmation.",
                },
                response.status === 429 ? 429 : 502,
            );
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        const message = candidate?.content?.parts
            ?.filter((part: { thought?: boolean }) => !part.thought)
            .map((part: { text?: string }) => part.text ?? "")
            .join("")
            .trim();

        if (!message || message.length < 50) {
            console.error(
                "Gemini returned an incomplete confirmation:",
                JSON.stringify({
                    message,
                    finishReason: candidate?.finishReason,
                    promptFeedback: result.promptFeedback,
                    usage: result.usageMetadata,
                }),
            );

            return json(
                { error: "AI returned an incomplete confirmation. Please try again." },
                502,
            );
        }

        return json({ message });
    } catch (error) {
        console.error("Confirmation function error:", error);

        return json(
            {
                error:
                    error instanceof Error && error.name === "TimeoutError"
                        ? "AI took too long to respond. Please try again."
                        : "Unable to generate confirmation.",
            },
            500,
        );
    }
});