// Promotion UI component

export function promotePawn(fromSquare, toSquare, legalPromotions) {
  // Render UI for pawn promotion
  const promotionOptions = legalPromotions.map(type => `<button onclick="handlePromotion('${type}')">${type.toUpperCase()}</button>`);
  document.getElementById('promotion-container').innerHTML = promotionOptions.join(' ');
}

function handlePromotion(type) {
  // Handle the promotion logic
}