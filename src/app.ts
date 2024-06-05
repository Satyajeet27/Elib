import express from "express";
import userRouter from "./user/user.routes";
import bookRouter from "./books/book.routes";
import globalError from "./middleware/globalError";
import authentication from "./middleware/authentication";

const app = express();
app.use(express.json());

app.get("/test", (req, res) => {
  res.send({
    message: "this is a testing",
  });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalError);

export default app;
