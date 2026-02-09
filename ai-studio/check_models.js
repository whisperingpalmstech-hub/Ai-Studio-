const models = [
    "stabilityai/stable-diffusion-2-1",
    "CompVis/stable-diffusion-v1-4",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "stabilityai/sdxl-turbo"
];

async function checkModels() {
    console.log("Checking Hugging Face Model Endpoints...");

    for (const model of models) {
        const url = `https://router.huggingface.co/models/${model}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer hf_dummy_token", // 401 means exists, 404 means not found
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: "test" })
            });

            console.log(`Model: ${model}`);
            console.log(`URL: ${url}`);
            console.log(`Status: ${response.status} ${response.statusText}`);

            if (response.status === 404) {
                console.log("--> PROBLEM: Model endpoint returned 404 (Not Found). Model might be private, gated, or not served.");
            } else if (response.status === 401) {
                console.log("--> OK: Endpoint exists (401 Unauthorized expected with dummy token).");
            } else {
                console.log(`--> Result: ${response.status}`);
            }
            console.log("---");
        } catch (error) {
            console.error(`Error checking ${model}:`, error.message);
        }
    }
}

checkModels();
