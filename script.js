const imageContainer = document.getElementById('image-container');
const startButton = document.getElementById('start-button');
const counter = document.getElementById('counter');
const finalMessage = document.getElementById('final-message');

let images = [
    'Images/500_333.jpg', 'Images/Aguila.jpg', 'Images/Animals.jpg', 'Images/Camaleon.jpg', 'Images/Cdmx.jpg',
    'Images/cerdos.jpg', 'Images/Ciudad.jpg', 'Images/Venus.jpg', 'Images/Ciudad2.jpeg', 'Images/Color.jpeg',
    'Images/Creacion.jpg', 'Images/Dali.jpg', 'Images/Europa.jpg', 'Images/Francia.jpg', 'Images/Great_Wave_off_Kanagawa2.jpg',
    'Images/Grito.jpg', 'Images/Japon.jpg', 'Images/Latin.jpg', 'Images/MexPaint.jpg', 'Images/Monreo.jpg',
    'Images/Montevideo.jpg', 'Images/ParisPaint.jpg', 'Images/Quijote.jpg', 'Images/Renacimiento.jpg', 'Images/Skyline_de_Monterrey.jpg',
    'Images/StarryNight.jpg', 'Images/Tigre.jpg', 'Images/Vacas.jpeg', 'Images/venado.jpg', 'Images/VenicePaint.jpg'
];

let currentImageIndex = 0;
let puzzlesSolved = 0; // Contador de rompecabezas resueltos
let isAlfaElevada = false; 
let isGammaConstante = false;
let isHintActive = false;
let isGameOver = false; // Bloqueador de acciones al terminar

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createPieces() {
    if (isGameOver) return;
    imageContainer.innerHTML = '';
    const imageUrl = images[currentImageIndex];
    let piecesArray = Array.from({length: 25}, (_, i) => i);
    shuffle(piecesArray);

    piecesArray.forEach((value) => {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.setAttribute('draggable', true);
        piece.dataset.correct = value;
        if (isAlfaElevada) piece.classList.add('blink-active');
        if (isGammaConstante) piece.classList.add('gamma-active');

        const x = (value % 5) * -100; 
        const y = Math.floor(value / 5) * -100;
        piece.style.backgroundImage = `url(${imageUrl})`;
        piece.style.backgroundPosition = `${x}% ${y}%`;

        addDragEvents(piece);
        imageContainer.appendChild(piece);
    });
    updateCounter();
}

function addDragEvents(piece) {
    piece.addEventListener('dragstart', () => { if(!isGameOver) window.draggedPiece = piece; });
    piece.addEventListener('dragover', (e) => e.preventDefault());
    piece.addEventListener('drop', () => {
        if (!isGameOver && window.draggedPiece && window.draggedPiece !== piece) {
            swapPieces(window.draggedPiece, piece);
            updateCounter();
        }
    });
}

function swapPieces(p1, p2) {
    const temp = document.createElement('div');
    imageContainer.insertBefore(temp, p1);
    imageContainer.insertBefore(p1, p2);
    imageContainer.insertBefore(p2, temp);
    imageContainer.removeChild(temp);
}

function updateCounter() {
    const pieces = document.querySelectorAll('.piece');
    let correct = 0;
    pieces.forEach((piece, index) => {
        if (parseInt(piece.dataset.correct) === index) correct++;
    });
    counter.innerText = `Piezas correctas: ${correct} / 25`;
    
    if (correct === 25) {
        puzzlesSolved++; // Sumamos uno al total resuelto
        currentImageIndex = (currentImageIndex + 1) % images.length;
        setTimeout(createPieces, 1000);
    }
}

function giveCorrectHint() {
    if (isHintActive || isGameOver) return;
    const pieces = Array.from(document.querySelectorAll('.piece'));
    const incorrectIndices = [];
    pieces.forEach((p, index) => {
        if (parseInt(p.dataset.correct) !== index) incorrectIndices.push(index);
    });

    if (incorrectIndices.length > 0) {
        isHintActive = true;
        const randomIdx = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
        const pieceAtFault = pieces[randomIdx];
        const targetValue = parseInt(pieceAtFault.dataset.correct);
        const targetSpotPiece = pieces[targetValue];

        pieceAtFault.classList.add('hint-wrong-piece');
        setTimeout(() => {
            pieceAtFault.classList.remove('hint-wrong-piece');
            if (targetSpotPiece) {
                targetSpotPiece.classList.add('hint-correct-spot');
                setTimeout(() => {
                    targetSpotPiece.classList.remove('hint-correct-spot');
                    isHintActive = false;
                }, 1500);
            } else { isHintActive = false; }
        }, 1000); 
    }
}

// --- LÓGICA DE TECLADO ---
document.addEventListener('keydown', (e) => {
    if (isGameOver) return; // Desactiva teclado si el tiempo terminó
    const pieces = document.querySelectorAll('.piece');
    
    if (e.key === "2") {
        isAlfaElevada = !isAlfaElevada;
        pieces.forEach(p => {
            if (isAlfaElevada) p.classList.add('blink-active');
            else p.classList.remove('blink-active');
        });
    } else if (e.key === "1") {
        isGammaConstante = !isGammaConstante;
        pieces.forEach(p => {
            if (isGammaConstante) p.classList.add('gamma-active');
            else p.classList.remove('gamma-active');
        });
    } else if (e.key === "3") {
        giveCorrectHint();
    } else if (e.key === "0") {
        isAlfaElevada = false;
        isGammaConstante = false;
        pieces.forEach(p => {
            p.classList.remove('blink-active');
            p.classList.remove('gamma-active');
        });
    }
});

// --- TEMPORIZADOR INVISIBLE DE 15 MINUTOS ---
function startHiddenTimer() {
    const fifteenMinutes = 15 * 60 * 1000; // milisegundos
    setTimeout(() => {
        isGameOver = true;
        imageContainer.innerHTML = ''; // Elimina el juego
        imageContainer.style.display = 'none';
        finalMessage.innerText = "Sesión finalizada";
        counter.innerHTML = `Entrenamiento completado.<br>Rompecabezas resueltos: <strong>${puzzlesSolved}</strong>`;
        // Ocultar instrucciones finales
        document.querySelector('.instrucciones').style.display = 'none';
    }, fifteenMinutes);
}

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    shuffle(images);
    createPieces();
    startHiddenTimer(); // Inicia el reloj secreto
});