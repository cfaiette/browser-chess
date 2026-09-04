export function showPromotionUI(callback) {
    const promotionDiv = document.createElement('div');
    promotionDiv.id = 'promotionUI';
    promotionDiv.style.position = 'absolute';

    // Create promotion options
    const pieces = ['Queen', 'Rook', 'Bishop', 'Knight'];
    pieces.forEach(piece => {
        const button = document.createElement('button');
        button.innerText = piece;
        button.onclick = () => {
            callback(piece);
            document.body.removeChild(promotionDiv);
        };
        promotionDiv.appendChild(button);
    });

    document.body.appendChild(promotionDiv);
}