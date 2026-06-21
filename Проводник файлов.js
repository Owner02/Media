class FileExplorer {
    constructor() {
        this.files = [];
        this.onFileSelect = null;
        this.init();
    }

    init() {
        this.setupFileInput();
        this.render();
    }

    setFiles(files) {
        this.files = files || [];
        this.render();
    }

    getFiles() {
        return this.files;
    }

    setupFileInput() {
        const addFilesBtn = document.getElementById('addFilesBtn');
        const fileInput = document.getElementById('fileInput');

        addFilesBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFilesAdded(e.target.files);
            fileInput.value = '';
        });

        // Поддержка drag & drop
        const fileList = document.getElementById('fileList');
        
        fileList.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileList.style.background = '#0f3460';
        });

        fileList.addEventListener('dragleave', () => {
            fileList.style.background = '';
        });

        fileList.addEventListener('drop', (e) => {
            e.preventDefault();
            fileList.style.background = '';
            this.handleFilesAdded(e.dataTransfer.files);
        });
    }

    handleFilesAdded(fileList) {
        const newFiles = Array.from(fileList).map(file => ({
            id: Date.now() + Math.random().toString(),
            name: file.name,
            type: file.type.startsWith('video/') ? 'video' : 'audio',
            size: file.size,
            url: URL.createObjectURL(file),
            file: file
        }));

        this.files = [...this.files, ...newFiles];
        this.render();
        this.dispatchUpdate();
    }

    removeFile(id) {
        const file = this.files.find(f => f.id === id);
        if (file) {
            URL.revokeObjectURL(file.url);
            this.files = this.files.filter(f => f.id !== id);
            this.render();
            this.dispatchUpdate();
        }
    }

    selectFile(id) {
        if (this.onFileSelect) {
            const file = this.files.find(f => f.id === id);
            if (file) {
                this.onFileSelect(file);
                this.updatePlayingState(id);
            }
        }
    }

    updatePlayingState(id) {
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.toggle('playing', item.dataset.id === id);
        });
    }

    render() {
        const container = document.getElementById('fileList');
        
        if (this.files.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #a0a0a0;">
                    <p>Перетащите файлы сюда или нажмите "Добавить файлы"</p>
                    <p style="font-size: 12px; margin-top: 10px;">
                        Поддерживаются видео и аудио файлы
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.files.map((file, index) => `
            <li class="file-item" data-id="${file.id}">
                <div class="file-info" onclick="app.fileExplorer.selectFile('${file.id}')">
                    <span class="file-icon">${file.type === 'video' ? '🎬' : '🎵'}</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatSize(file.size)}</span>
                </div>
                <button class="delete-btn" 
                        onclick="event.stopPropagation(); app.fileExplorer.removeFile('${file.id}')">
                    ×
                </button>
            </li>
        `).join('');
    }

    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    dispatchUpdate() {
        document.dispatchEvent(new CustomEvent('filesUpdated', {
            detail: { files: this.files }
        }));
    }
}