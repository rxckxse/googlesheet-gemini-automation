function registerCustomFunctions() {
  if (typeof CustomFunctions === 'undefined') {
    console.warn("CustomFunctions runtime is not available yet.");
    return;
  }

  CustomFunctions.associate("ASK", askGemini);
  console.log("Registered custom function: GEMINI.ASK");
}

// Ensure Office is ready before associating the function.
if (typeof Office !== 'undefined' && typeof Office.onReady === 'function') {
  Office.onReady(function (info) {
    console.log("Office is ready in Custom Functions context. Host:", info.host);
    registerCustomFunctions();
  });
} else {
  registerCustomFunctions();
}

/**
 * Calls Google Gemini model to process the provided text.
 * @customfunction
 * @param {string} text The input text.
 * @param {string} [systemInstruction] Optional system instruction override.
 * @param {string} [model] Optional model override.
 * @returns {Promise<string>} The response from Gemini.
 */
function askGemini(text, systemInstruction, model) {
  return new Promise((resolve) => {
    const promptText = String(text || "");
    if (promptText.trim() === "") {
      resolve("");
      return;
    }

    let finalSystemInstruction = systemInstruction;
    let finalModel = model;

    try {
      if (!finalSystemInstruction) {
        if (typeof Office !== 'undefined' && Office.context && Office.context.document) {
          finalSystemInstruction = Office.context.document.settings.get("defaultSystemInstruction");
        }
        if (!finalSystemInstruction && typeof localStorage !== 'undefined') {
          finalSystemInstruction = localStorage.getItem("defaultSystemInstruction");
        }
      }

      if (!finalModel) {
        if (typeof Office !== 'undefined' && Office.context && Office.context.document) {
          finalModel = Office.context.document.settings.get("defaultModel");
        }
        if (!finalModel && typeof localStorage !== 'undefined') {
          finalModel = localStorage.getItem("defaultModel");
        }
      }
    } catch (e) {
      console.warn("Failed to read Office settings or localStorage:", e);
    }

    finalSystemInstruction = finalSystemInstruction || "";

    const apiEndpoint = typeof window !== 'undefined'
      ? window.location.origin + '/api/gemini'
      : 'https://localhost:3000/api/gemini';

    const requestBody = {
      text: promptText,
      systemInstruction: finalSystemInstruction,
    };

    if (finalModel) {
      requestBody.model = finalModel;
    }

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          throw new Error(errData.error || 'Server error: ' + response.status);
        });
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        resolve("Error: " + data.error);
      } else {
        try {
          saveHistoryItem({
            timestamp: new Date().toLocaleTimeString(),
            input: promptText.substring(0, 30) + (promptText.length > 30 ? '...' : ''),
            model: finalModel || 'server-default',
            status: 'success',
            latency: 'calculated'
          });
        } catch (e) {
          console.warn("Failed to save success history:", e);
        }
        resolve(data.result);
      }
    })
    .catch(err => {
      try {
        saveHistoryItem({
          timestamp: new Date().toLocaleTimeString(),
          input: promptText.substring(0, 30) + (promptText.length > 30 ? '...' : ''),
          model: finalModel || 'server-default',
          status: 'error',
          details: err.message
        });
      } catch (e) {
        console.warn("Failed to save error history:", e);
      }
      resolve("Error: " + err.message);
    });
  });
}

function saveHistoryItem(item) {
  if (typeof localStorage !== 'undefined') {
    try {
      const historyJson = localStorage.getItem("geminiHistory") || "[]";
      const history = JSON.parse(historyJson);
      history.unshift(item);
      localStorage.setItem("geminiHistory", JSON.stringify(history.slice(0, 20)));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn("Failed to write to localStorage history:", e);
    }
  }
}


