/* dit bestand bevat de functies die nodig zijn om de statistieken van een film te berekenen, zoals het gemiddelde aantal sterren
  van de comments die aan een film zijn toegevoegd, deze functies worden gebruikt in de comments router om ervoor te zorgen dat
  de statistieken van een film correct worden berekend en weergegeven in de API responses */

export function getAverageStars(comments = []) {
  let totalStars = 0;

  for (let i = 0; i < comments.length; i++) {
    totalStars += Number(comments[i].stars) || 0;
  }

  return comments.length ? totalStars / comments.length : 0;
}