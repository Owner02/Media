class App {
    constructor() {
        this.titles = this.loadTitles();
        this.currentTitleId = null;
        this.fileExplorer = new FileExplorer();
        this.mediaPlayer = new MediaPlayer();
        
        this.init();
    }

    init() {
        this.renderTitles();
        this.setupEventListeners();
        
        // Загружаем первый тайтл если есть
        if (this.titles.length > 0) {
            this.selectTitle(this.titles[0].id);
        }
    }

    loadTitles() {
        const saved = localStorage.getItem('mediaPlayerTitles');
        return saved ? JSON.parse(saved) : [];
    }

    saveTitles() {
        localStorage.setItem('mediaPlayerTitles', JSON.stringify(this.titles));
    }

    addTitle(name) {
        const title = {
            id: Date.now().toString(),
            name: name,
            files: [],
            createdAt: new Date().toISOString()
        };
        
        this.titles.push(title);
        this.saveTitles();
        this.renderTitles();
        this.selectTitle(title.id);
        
        return title;
    }

    deleteTitle(id) {
        this.titles = this.titles.filter(t => t.id !== id);
        
        if (this.currentTitleId === id) {
            this.currentTitleId = this.titles.length > 0 ? this.titles[0].id : null;
            if (this.currentTitleId) {
                this.selectTitle(this.currentTitleId);
            } else {
                this.clearMainContent();
            }
        }
        
        this.saveTitles();
        this.renderTitles();
    }

    selectTitle(id) {
        this.currentTitleId = id;
        const title = this.titles.find(t => t.id === id);
        
        if (title) {
            this.fileExplorer.setFiles(title.files);
            this.mediaPlayer.setPlaylist(title.files);
            this.updateActiveTitle();
        }
    }

    updateActiveTitle() {
        document.querySelectorAll('.title-card').forEach(card => {
            card.classList.toggle('active', card.dataset.id === this.currentTitleId);
        });
    }

    renderTitles() {
        const container = document.getElementById('titlesList');
        
        container.innerHTML = this.titles.map(title => `
            <div class="title-card ${title.id === this.currentTitleId ? 'active' : ''}" 
                 data-id="${title.id}">
                <h3>${title.name}</h3>
                <div class="file-count">${title.files.length} файлов</div>
                <button class="delete-btn" onclick="event.stopPropagation(); app.deleteTitle('${title.id}')">
                    🗑
                </button>
            </div>
        `).join('');

        // Добавляем обработчики кликов
        container.querySelectorAll('.title-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectTitle(card.dataset.id);
            });
        });
    }

    clearMainContent() {
        this.fileExplorer.setFiles([]);
        this.mediaPlayer.clearPlaylist();
    }

    setupEventListeners() {
        // Добавление нового тайтла
        document.getElementById('addTitleBtn').addEventListener('click', () => {
            this.showAddTitleModal();
        });

        // Слушаем обновления файлов
        document.addEventListener('filesUpdated', (e) => {
            const title = this.titles.find(t => t.id === this.currentTitleId);
            if (title) {
                title.files = e.detail.files;
                this.saveTitles();
                this.renderTitles();
                this.mediaPlayer.setPlaylist(title.files);
            }
        });
    }

    showAddTitleModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Новый тайтл</h3>
                <input type="text" id="titleNameInput" 
                       placeholder="Введите название" autofocus>
                <div class="modal-buttons">
                    <button class="btn-secondary" id="cancelBtn">Отмена</button>
                    <button class="btn-primary" id="createBtn">Создать</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#titleNameInput');
        const createBtn = modal.querySelector('#createBtn');
        const cancelBtn = modal.querySelector('#cancelBtn');
        
        const closeModal = () => {
            modal.remove();
        };
        
        const create = () => {
            const name = input.value.trim();
            if (name) {
                this.addTitle(name);
                closeModal();
            }
        };
        
        createBtn.addEventListener('click', create);
        cancelBtn.addEventListener('click', closeModal);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') create();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        input.focus();
    }
}

// Запуск приложения
const app = new App();