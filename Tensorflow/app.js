
let model;
const loadingIndicator = document.getElementById('loading');
const imagesContainer = document.getElementById('imagesContainer');
const resultDiv = document.getElementById('result');
const themeToggle = document.getElementById('themeToggle');
const modelSelect = document.getElementById('modelSelect');
const clearHistoryButton = document.getElementById('clearHistory');
const downloadPredictionsButton = document.getElementById('downloadPredictions');
let predictionHistory = [];


async function loadModel() {
    try {
        loadingIndicator.style.display = 'block';
        const selectedModel = modelSelect.value;
        model = selectedModel === 'mobilenet' ? await mobilenet.load() : selectedModel === 'inception' ? await inception.load() : await resnet.load();
        console.log(`${selectedModel} model loaded`);
    } catch (error) {
        console.error("Error loading model:", error);
        showError("Failed to load the model. Please try again.");
    } finally {
        loadingIndicator.style.display = 'none';
    }
}


document.getElementById('imageUpload').addEventListener('change', async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        resultDiv.innerHTML = ''; 
        imagesContainer.innerHTML = ''; 

        for (const file of files) {
            const imgElement = document.createElement('img');
            imgElement.src = URL.createObjectURL(file);
            imgElement.style.display = 'none'; 

            const card = document.createElement('div');
            card.className = 'image-card';
            imagesContainer.appendChild(card);
            card.appendChild(imgElement);

            imgElement.onload = async () => {
                imgElement.style.display = 'block'; 
                const predictions = await predictImage(imgElement);
                displayResults(predictions, file.name, card);
            };
        }
    }
});


async function predictImage(imgElement) {
    try {
        loadingIndicator.style.display = 'block';
        return await model.classify(imgElement);
    } catch (error) {
        console.error("Error during prediction:", error);
        showError("Failed to make predictions. Please try again.");
        return [];
    } finally {
        loadingIndicator.style.display = 'none';
    }
}


function displayResults(predictions, imageName, card) {
    const imageResults = document.createElement('div');
    imageResults.innerHTML = `<h2>Predictions for ${imageName}:</h2>`;
    predictions.forEach(prediction => {
        imageResults.innerHTML += `<p class="prediction">${prediction.className}: ${Math.round(prediction.probability * 100)}%</p>`;
    });
    card.appendChild(imageResults);
    predictionHistory.push({ imageName, predictions });
}


function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.innerText = message;
    resultDiv.appendChild(errorDiv);
}


clearHistoryButton.addEventListener('click', () => {
    predictionHistory = [];
    resultDiv.innerHTML = '<p>Prediction history cleared.</p>';
});


downloadPredictionsButton.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(predictionHistory));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "predictions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});


themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    themeToggle.innerText = document.body.classList.contains('light-theme') ? '🌙' : '☀️';
});

loadModel()