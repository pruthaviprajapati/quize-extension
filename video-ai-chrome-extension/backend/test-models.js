import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');
  console.log('\nFetching available models from Gemini API...\n');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Response:', errorText);
      return;
    }

    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      console.log('Available models:');
      data.models.forEach(model => {
        console.log(`\n  Name: ${model.name}`);
        console.log(`  Display Name: ${model.displayName}`);
        if (model.supportedGenerationMethods) {
          console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('No models found or API key is invalid.');
    }
  } catch (error) {
    console.error('Error fetching models:', error.message);
  }
}

listModels();
