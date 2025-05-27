import { Seat } from "../database/models/Seat";
import { Show } from "../database/models/Show";

const seedSeatsForAllShows = async () => {
  try {
    const shows = await Show.findAll();

    if (shows.length === 0) {
      console.log("No shows found in the database.");
      return;
    }

    for (const show of shows) {
      console.log(`Seeding seats for show: ${show.title} (ID: ${show.id})`);

      // Delete existing seats for this show
      await Seat.destroy({ where: { showId: show.id } });

      const seats = [];
      for (let i = 1; i <= show.totalSeats; i++) {
        seats.push({
          showId: show.id,
          seatNumber: i.toString(),
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
