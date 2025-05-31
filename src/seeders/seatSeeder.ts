import { Seat } from "../database/models/Seat";
import { Show } from "../database/models/Show";

const seedSeatsForAllShows = async () => {
  try {
    const shows = await Show.findAll();

    if (shows.length === 0) {
      console.log("No shows found in the database.");
      return;
    }

    const seatRows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");  
    const seatsPerRow = 10;

    for (const show of shows) {
      console.log(`Seeding seats for show: ${show.title} (ID: ${show.id})`);

    
      await Seat.destroy({ where: { showId: show.id } });

      const seats = [];

      for (let i = 0; i < show.totalSeats; i++) {
        const rowIndex = Math.floor(i / seatsPerRow);
        const seatNumberInRow = (i % seatsPerRow) + 1;

     
        if (rowIndex >= seatRows.length) {
          throw new Error(`Not enough rows to seed all seats for show ${show.title}`);
        }

        seats.push({
          showId: show.id,
          seatNumber: `${seatRows[rowIndex]}${seatNumberInRow}`,
          isBooked: false,
          bookingId: null,
        });
      }

      await Seat.bulkCreate(seats);
      console.log(`Seeded ${show.totalSeats} seats for "${show.title}"`);
    }

    console.log("All seats seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedSeatsForAllShows();
