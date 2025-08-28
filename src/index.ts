/*
! Runtime entry point of the application
*/

// Import environment variables from .env file
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server is running at http://localhost:${PORT}`)
  );
}
