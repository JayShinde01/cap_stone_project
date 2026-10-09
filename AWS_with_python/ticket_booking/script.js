// ==========================================
// API CONFIGURATION
// ==========================================

// IMPORTANT:
// Put your REAL API Gateway Invoke URL here.
//
// Example:
// const API_URL = "https://abc123.execute-api.ap-south-1.amazonaws.com";

const API_URL =
    "https://apg1wo3863.execute-api.ap-south-1.amazonaws.com";


// ==========================================
// GLOBAL VARIABLES
// ==========================================

let selectedSeats = [];

let bookedSeats = [];

let selectedDate = "";

let selectedTime = "";

const localBookingsKey =
    "ticketBookingLocalRecords";

let ticketsLoadRequest = 0;


// ==========================================
// MOVIE SHOWTIMES
// ==========================================

const movieShowtimes = {

    Avengers: [
        "10:00",
        "13:30",
        "16:30",
        "20:00"
    ],

    Avatar: [
        "11:00",
        "14:00",
        "18:00",
        "21:00"
    ],

    Interstellar: [
        "09:30",
        "12:30",
        "17:00",
        "20:30"
    ]

};


// ==========================================
// DOM ELEMENTS
// ==========================================

const movieSelect =
    document.getElementById("movie");

const dateContainer =
    document.getElementById("dateContainer");

const timeContainer =
    document.getElementById("timeContainer");

const seats =
    document.querySelectorAll(".seat");

const selectedSeatDisplay =
    document.getElementById("selectedSeat");

const seatCount =
    document.getElementById("seatCount");

const availableSeatCount =
    document.getElementById("availableSeatCount");

const customerInput =
    document.getElementById("customer");

const emailInput =
    document.getElementById("email");

const bookButton =
    document.getElementById("bookButton");

const message =
    document.getElementById("message");

const ticketsContainer =
    document.getElementById("ticketsContainer");

const refreshButton =
    document.getElementById("refreshButton");

const groupButton =
    document.getElementById("groupButton");

const groupControls =
    document.getElementById("groupControls");

const groupSize =
    document.getElementById("groupSize");

const findGroupButton =
    document.getElementById("findGroupButton");


// ==========================================
// INITIALIZE APPLICATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        generateDates();

        updateShowtimes();

        loadTickets();

    }
);


// ==========================================
// MOVIE CHANGE
// ==========================================

movieSelect.addEventListener(
    "change",
    () => {

        selectedSeats = [];

        selectedDate = "";

        selectedTime = "";

        clearSeatSelection();

        updateSelectedSeats();

        generateDates();

        updateShowtimes();

        loadTickets();

    }
);


// ==========================================
// GENERATE NEXT 7 DAYS
// ==========================================

function generateDates() {

    dateContainer.innerHTML = "";

    const today = new Date();


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() + i
        );


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        const dateValue =
            `${year}-${month}-${day}`;


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const monthName =
            date.toLocaleDateString(
                "en-US",
                {
                    month: "short"
                }
            );


        const dateButton =
            document.createElement(
                "button"
            );


        dateButton.type = "button";

        dateButton.className =
            "date-button";


        if (i === 0) {

            dateButton.classList.add(
                "active"
            );

            selectedDate =
                dateValue;
        }


        dateButton.innerHTML = `
            <span class="date-day">
                ${i === 0 ? "Today" : dayName}
            </span>

            <span class="date-number">
                ${day}
            </span>

            <span class="date-month">
                ${monthName}
            </span>
        `;


        dateButton.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".date-button"
                    )
                    .forEach(
                        button =>
                            button.classList.remove(
                                "active"
                            )
                    );


                dateButton.classList.add(
                    "active"
                );


                selectedDate =
                    dateValue;


                selectedSeats = [];

                clearSeatSelection();

                updateSelectedSeats();

                updateShowtimes();

                loadTickets();

            }
        );


        dateContainer.appendChild(
            dateButton
        );

    }

}


// ==========================================
// GENERATE SHOWTIMES
// ==========================================

function updateShowtimes() {

    timeContainer.innerHTML = "";

    selectedTime = "";

    const movie =
        movieSelect.value;


    const showtimes =
        movieShowtimes[movie];


    if (!showtimes) {

        return;
    }


    showtimes.forEach(
        time => {

            const timeButton =
                document.createElement(
                    "button"
                );


            timeButton.type =
                "button";


            timeButton.className =
                "time-button";


            timeButton.innerHTML = `
                <i class="fa-regular fa-clock"></i>
                ${formatTime(time)}
            `;


            timeButton.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".time-button"
                        )
                        .forEach(
                            button =>
                                button.classList.remove(
                                    "active"
                                )
                        );


                    timeButton.classList.add(
                        "active"
                    );


                    selectedTime =
                        time;


                    selectedSeats = [];

                    clearSeatSelection();

                    updateSelectedSeats();

                    loadTickets();

                }
            );


            timeContainer.appendChild(
                timeButton
            );

        }
    );


    // Automatically select first show
    const firstButton =
        timeContainer.querySelector(
            ".time-button"
        );


    if (firstButton) {

        firstButton.click();

    }

}


// ==========================================
// FORMAT TIME
// ==========================================
function formatTime(time) {

    // Handle old bookings that don't have a time
    if (!time) {
        return "N/A";
    }

    const parts = time.split(":");

    if (parts.length < 2) {
        return time;
    }

    const hours = parts[0];
    const minutes = parts[1];

    let hour = parseInt(hours);

    if (isNaN(hour)) {
        return time;
    }

    const ampm =
        hour >= 12 ? "PM" : "AM";

    hour =
        hour % 12 || 12;

    return `${hour}:${minutes} ${ampm}`;
}
// ==========================================
// MANUAL SEAT SELECTION
// ==========================================

seats.forEach(
    seat => {

        seat.addEventListener(
            "click",
            () => {

                if (
                    seat.classList.contains(
                        "booked"
                    )
                ) {

                    return;

                }


                if (!selectedDate) {

                    showMessage(
                        "Please select a date first.",
                        "error"
                    );

                    return;

                }


                if (!selectedTime) {

                    showMessage(
                        "Please select a showtime first.",
                        "error"
                    );

                    return;

                }


                const seatNumber =
                    seat.dataset.seat;


                // Remove seat
                if (
                    selectedSeats.includes(
                        seatNumber
                    )
                ) {

                    selectedSeats =
                        selectedSeats.filter(
                            s =>
                                s !== seatNumber
                        );


                    seat.classList.remove(
                        "selected"
                    );

                }

                // Add seat
                else {

                    selectedSeats.push(
                        seatNumber
                    );


                    seat.classList.add(
                        "selected"
                    );

                }


                updateSelectedSeats();

            }
        );

    }
);


// ==========================================
// UPDATE SELECTED SEATS
// ==========================================

function updateSelectedSeats() {

    if (
        selectedSeats.length === 0
    ) {

        selectedSeatDisplay.textContent =
            "None";

    } else {

        selectedSeatDisplay.textContent =
            selectedSeats.join(", ");

    }


    seatCount.textContent =
        selectedSeats.length;

    updateAvailableSeatCount();

}

function updateAvailableSeatCount() {

    if (!availableSeatCount) {

        return;

    }

    availableSeatCount.textContent =
        seats.length - bookedSeats.length;

}


// ==========================================
// CLEAR SEAT SELECTION
// ==========================================

function clearSeatSelection() {

    bookedSeats = [];

    seats.forEach(
        seat => {

            seat.classList.remove(
                "selected"
            );

            seat.classList.remove(
                "booked"
            );

        }
    );

    updateAvailableSeatCount();

}


// ==========================================
// GROUP BUTTON
// ==========================================

groupButton.addEventListener(
    "click",
    () => {

        if (
            groupControls.style.display ===
            "none"
        ) {

            groupControls.style.display =
                "block";

        } else {

            groupControls.style.display =
                "none";

        }

    }
);


// ==========================================
// FIND GROUP SEATS
// ==========================================

findGroupButton.addEventListener(
    "click",
    () => {

        const size =
            parseInt(
                groupSize.value
            );


        if (
            !selectedDate ||
            !selectedTime
        ) {

            showMessage(
                "Please select date and showtime first.",
                "error"
            );

            return;

        }


        if (
            !size ||
            size < 1 ||
            size > 6
        ) {

            showMessage(
                "Please select between 1 and 6 seats.",
                "error"
            );

            return;

        }


        selectedSeats = [];

        clearSeatSelection();


        const rows =
            ["A", "B", "C", "D"];


        let foundSeats = null;


        for (
            const row of rows
        ) {

            for (
                let start = 1;
                start <= 6 - size + 1;
                start++
            ) {

                const possibleSeats = [];


                for (
                    let i = 0;
                    i < size;
                    i++
                ) {

                    const seatName =
                        `${row}${start + i}`;


                    if (
                        bookedSeats.includes(
                            seatName
                        )
                    ) {

                        break;

                    }


                    possibleSeats.push(
                        seatName
                    );

                }


                if (
                    possibleSeats.length ===
                    size
                ) {

                    foundSeats =
                        possibleSeats;

                    break;

                }

            }


            if (foundSeats) {

                break;

            }

        }


        if (!foundSeats) {

            showMessage(
                `Could not find ${size} adjacent available seats.`,
                "error"
            );

            return;

        }


        foundSeats.forEach(
            seatName => {

                selectedSeats.push(
                    seatName
                );


                const seatElement =
                    document.querySelector(
                        `.seat[data-seat="${seatName}"]`
                    );


                if (seatElement) {

                    seatElement.classList.add(
                        "selected"
                    );

                }

            }
        );


        updateSelectedSeats();


        showMessage(
            `Selected ${foundSeats.join(", ")}`,
            "success"
        );

    }
);


// ==========================================
// BOOK TICKETS
// ==========================================

bookButton.addEventListener(
    "click",
    async () => {

        const movie =
            movieSelect.value;


        const customer =
            customerInput.value.trim();


        const email =
            emailInput.value.trim();


        // ----------------------------------
        // Validation
        // ----------------------------------

        if (!selectedDate) {

            showMessage(
                "Please select a date.",
                "error"
            );

            return;

        }


        if (!selectedTime) {

            showMessage(
                "Please select a showtime.",
                "error"
            );

            return;

        }


        if (
            selectedSeats.length === 0
        ) {

            showMessage(
                "Please select at least one seat.",
                "error"
            );

            return;

        }


        if (!customer) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            return;

        }


        if (!email) {

            showMessage(
                "Please enter your email.",
                "error"
            );

            return;

        }


        // ----------------------------------
        // Booking object
        // ----------------------------------

        const bookingData = {

            movie: movie,

            date: selectedDate,

            time: selectedTime,

            seats: selectedSeats,

            customer: customer,

            email: email

        };


        console.log(
            "Sending booking:",
            bookingData
        );


        try {

            bookButton.disabled =
                true;


            bookButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>
                 Booking...`;


            const response =
                await fetch(
                    `${API_URL}/book-ticket`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                bookingData
                            )

                    }
                );


            const data =
                await response.json();


            console.log(
                "Booking response:",
                data
            );


            if (!response.ok) {

                showMessage(
                    data.message ||
                    "Booking failed.",
                    "error"
                );

                return;

            }


            // --------------------------------
            // Successful booking
            // --------------------------------

            showMessage(
                `Booking successful! ID: ${data.bookingId}`,
                "success"
            );


            selectedSeats = [];


            clearSeatSelection();


            updateSelectedSeats();


            customerInput.value = "";

            emailInput.value = "";


            await loadTickets();


            markSeatsAsBooked(
                bookingData.seats
            );


            saveLocalBooking(
                {
                    bookingId: data.bookingId,
                    movie: bookingData.movie,
                    date: bookingData.date,
                    time: bookingData.time,
                    seats: bookingData.seats
                }
            );


        }

        catch (error) {

            console.error(
                "Booking error:",
                error
            );


            showMessage(
                "Could not connect to the booking server.",
                "error"
            );

        }

        finally {

            bookButton.disabled =
                false;


            bookButton.innerHTML =
                `<i class="fa-solid fa-ticket"></i>
                 Book Selected Seats`;

        }

    }
);


// ==========================================
// LOAD TICKETS
// ==========================================
// ==========================================
// LOAD TICKETS
// ==========================================

function markSeatsAsBooked(seatNames) {

    seatNames.forEach(
        seatName => {

            const cleanSeatName =
                String(seatName).trim();

            const seatElement =
                document.querySelector(
                    `.seat[data-seat="${cleanSeatName}"]`
                );

            if (seatElement) {

                seatElement.classList.remove(
                    "selected"
                );

                seatElement.classList.add(
                    "booked"
                );

            }

            if (!bookedSeats.includes(cleanSeatName)) {

                bookedSeats.push(cleanSeatName);

            }

            updateAvailableSeatCount();

        }
    );

}

function getLocalBookings() {

    try {

        const records =
            JSON.parse(
                localStorage.getItem(
                    localBookingsKey
                ) || "[]"
            );

        return Array.isArray(records)
            ? records
            : [];

    }

    catch (error) {

        return [];

    }

}

function saveLocalBooking(booking) {

    const records =
        getLocalBookings();

    records.push(booking);

    localStorage.setItem(
        localBookingsKey,
        JSON.stringify(records)
    );

}

function removeLocalBooking(bookingId) {

    const records =
        getLocalBookings().filter(
            booking =>
                booking.bookingId !== bookingId
        );

    localStorage.setItem(
        localBookingsKey,
        JSON.stringify(records)
    );

}
async function loadTickets() {

    const requestId =
        ++ticketsLoadRequest;

    const requestedMovie =
        movieSelect.value;

    const requestedDate =
        String(selectedDate || "").trim();

    const requestedTime =
        String(selectedTime || "").trim();

    try {

        const response =
            await fetch(
                `${API_URL}/tickets`
            );


        const data =
            await response.json();


        console.log(
            "All tickets:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not load tickets"
            );

        }

        if (
            requestId !== ticketsLoadRequest ||
            requestedMovie !== movieSelect.value ||
            requestedDate !== String(selectedDate || "").trim() ||
            requestedTime !== String(selectedTime || "").trim()
        ) {

            return;

        }


        // ==========================================
        // CURRENT SHOW
        // ==========================================

        const currentMovie =
            requestedMovie;

        const currentDate =
            requestedDate;

        const currentTime =
            requestedTime;


        console.log(
            "CURRENT SHOW:",
            {
                movie: currentMovie,
                date: currentDate,
                time: currentTime
            }
        );


        // ==========================================
        // RESET BOOKED SEATS
        // ==========================================

        bookedSeats = [];


        seats.forEach(
            seat => {

                seat.classList.remove(
                    "booked"
                );

                seat.classList.remove(
                    "selected"
                );

            }
        );


        // ==========================================
        // CHECK BOOKINGS
        // ==========================================

        const tickets = [
            ...data.tickets,
            ...getLocalBookings()
        ];


        tickets.forEach(
            booking => {

                const bookingMovie =
                    String(
                        booking.movie || ""
                    ).trim();


                const bookingDate =
                    String(
                        booking.date || ""
                    ).trim();


                const bookingTime =
                    String(
                        booking.time || ""
                    ).trim();


                console.log(
                    "CHECKING BOOKING:",
                    {
                        movie: bookingMovie,
                        date: bookingDate,
                        time: bookingTime,
                        seats: booking.seats
                    }
                );


                // ==========================================
                // MATCH CURRENT MOVIE + DATE + TIME
                // ==========================================

                if (
                    bookingMovie === currentMovie &&
                    bookingDate === currentDate &&
                    bookingTime === currentTime
                ) {


                    console.log(
                        "MATCHED BOOKING:",
                        booking
                    );


                    // Make sure seats is an array

                    const bookingSeats =
                        Array.isArray(
                            booking.seats
                        )
                            ? booking.seats
                            : [];


                    bookingSeats.forEach(
                        seatName => {

                            const cleanSeatName =
                                String(
                                    seatName
                                ).trim();


                            bookedSeats.push(
                                cleanSeatName
                            );


                            // ==========================================
                            // FIND SEAT BUTTON
                            // ==========================================

                            const seatElement =
                                document.querySelector(
                                    `.seat[data-seat="${cleanSeatName}"]`
                                );


                            console.log(
                                "BOOKING SEAT:",
                                cleanSeatName,
                                "ELEMENT:",
                                seatElement
                            );


                            if (seatElement) {

                                // Remove selected first

                                seatElement.classList.remove(
                                    "selected"
                                );


                                // Add booked

                                seatElement.classList.add(
                                    "booked"
                                );


                                console.log(
                                    "BOOKED CLASS ADDED:",
                                    cleanSeatName,
                                    seatElement.className
                                );

                            }

                        }
                    );

                }

            }
        );


        console.log(
            "FINAL BOOKED SEATS:",
            bookedSeats
        );

        updateAvailableSeatCount();


        // ==========================================
        // DISPLAY ALL TICKETS
        // ==========================================

        displayTickets(
            data.tickets
        );

    }


    catch (error) {

        console.error(
            "Load tickets error:",
            error
        );


        ticketsContainer.innerHTML =
            `
                <p class="empty-message">
                    Could not load bookings.
                </p>
            `;

    }

}

// ==========================================
// DISPLAY BOOKINGS
// ==========================================

function displayTickets(tickets) {

    if (
        !tickets ||
        tickets.length === 0
    ) {

        ticketsContainer.innerHTML =
            `
            <p class="empty-message">
                No tickets booked yet.
            </p>
            `;

        return;

    }


    ticketsContainer.innerHTML = "";


    tickets.forEach(
        ticket => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "ticket-card";


            const seatsText =
                ticket.seats.join(", ");


            card.innerHTML =
                `
                <div class="ticket-info">

                    <h3>
                        ${ticket.movie}
                    </h3>

                    <p>
                        <strong>Booking ID:</strong>
                        ${ticket.bookingId}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${formatDisplayDate(
                            ticket.date
                        )}
                    </p>

                    <p>
                        <strong>Showtime:</strong>
                        ${formatTime(
                            ticket.time
                        )}
                    </p>

                    <p>
                        <strong>Seats:</strong>
                        ${seatsText}
                    </p>

                    <p>
                        <strong>Customer:</strong>
                        ${ticket.customer}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${ticket.email}
                    </p>

                </div>

                <button
                    type="button"
                    class="cancel-button"
                    onclick="cancelBooking('${ticket.bookingId}')"
                >

                    <i class="fa-solid fa-trash"></i>

                    Cancel Booking

                </button>
                `;


            ticketsContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// FORMAT DISPLAY DATE
// ==========================================

function formatDisplayDate(dateString) {

    if (!dateString) {

        return "N/A";

    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// CANCEL BOOKING
// ==========================================

async function cancelBooking(
    bookingId
) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this entire booking?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/ticket/${bookingId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        console.log(
            "Delete response:",
            data
        );


        if (!response.ok) {

            showMessage(
                data.message ||
                "Could not cancel booking.",
                "error"
            );

            return;

        }


        showMessage(
            "Booking cancelled successfully.",
            "success"
        );


        removeLocalBooking(
            bookingId
        );


        await loadTickets();

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showMessage(
            "Could not connect to the server.",
            "error"
        );

    }

}


// ==========================================
// REFRESH
// ==========================================

refreshButton.addEventListener(
    "click",
    () => {

        loadTickets();

    }
);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.className =
        `message ${type}`;


    setTimeout(
        () => {

            message.textContent =
                "";

            message.className =
                "message";

        },
        5000
    );

}