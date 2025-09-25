class AIImageAnalyzer {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.fileName = document.getElementById('fileName');
        this.removeImage = document.getElementById('removeImage');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.results = document.getElementById('results');
        this.analysisContent = document.getElementById('analysisContent');
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        this.btnText = document.querySelector('.btn-text');
        this.loadingSpinner = document.querySelector('.loading-spinner');
    }

    attachEventListeners() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Remove image
        this.removeImage.addEventListener('click', this.clearImage.bind(this));

        // Analyze button
        this.analyzeBtn.addEventListener('click', this.analyzeImage.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showError('File size must be less than 5MB.');
            return;
        }

        this.displayImage(file);
        this.hideError();
    }

    displayImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImg.src = e.target.result;
            this.fileName.textContent = file.name;
            this.imagePreview.style.display = 'block';
            this.analyzeBtn.disabled = false;
            this.hideResults();
        };
        reader.readAsDataURL(file);
    }

    clearImage() {
        this.imagePreview.style.display = 'none';
        this.fileInput.value = '';
        this.analyzeBtn.disabled = true;
        this.hideResults();
        this.hideError();
    }

    async analyzeImage() {
        const file = this.fileInput.files[0];
        if (!file) return;

        this.setLoadingState(true);
        this.hideError();
        this.hideResults();

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data.analysis);
            } else {
                this.showError(data.error || 'Failed to analyze image');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (loading) {
            this.btnText.textContent = 'Analyzing...';
            this.loadingSpinner.style.display = 'inline-block';
            this.analyzeBtn.disabled = true;
        } else {
            this.btnText.textContent = 'Analyze Image';
            this.loadingSpinner.style.display = 'none';
            this.analyzeBtn.disabled = false;
        }
    }

    displayResults(analysis) {
        this.analysisContent.textContent = analysis;
        this.results.style.display = 'block';
        this.results.scrollIntoView({ behavior: 'smooth' });
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.error.style.display = 'block';
    }

    hideError() {
        this.error.style.display = 'none';
    }

    hideResults() {
        this.results.style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIImageAnalyzer();
});
