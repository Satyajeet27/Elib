import { Router } from "express";
import multer from "multer";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getSingleBook,
  updateBook,
} from "./book.controller";
import path from "path";
import authentication from "../middleware/authentication";

const router = Router();
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fieldSize: 1e7 },
});

router.post(
  "/create",
  authentication,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);
router.put(
  "/:bookId",
  authentication,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);
router.delete("/:bookId", authentication, deleteBook);
router.get("/", getAllBooks);
router.get("/", getSingleBook);

export default router;
