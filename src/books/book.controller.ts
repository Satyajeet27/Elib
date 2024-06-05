import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import fs from "node:fs";
import bookModel from "./book.model";
import { AuthRequest } from "../middleware/authentication";

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, genre } = req.body;
  // console.log(req.files);
  const { coverImage, file } = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
  const coverImageFileName = coverImage[0].filename;
  const coverImageFilePath = path.resolve(
    __dirname,
    "./../../public/data/uploads",
    coverImageFileName
  );
  const fileName = file[0].filename;
  const filePath = path.resolve(
    __dirname,
    "./../../public/data/uploads",
    fileName
  );
  try {
    const coverImageUploadResult = await cloudinary.v2.uploader.upload(
      coverImageFilePath,
      {
        filename_override: coverImageFileName,
        resource_type: "image",
        format: coverImage[0].mimetype.split("/").at(-1),
        folder: "cover-image",
      }
    );
    // console.log("cover Image", coverImageUploadResult);

    const fileUploadResult = await cloudinary.v2.uploader.upload(filePath, {
      resource_type: "raw",
      format: "pdf",
      filename_override: fileName,
      folder: "book-pdfs",
    });
    // console.log("file pdf", fileUploadResult);
    try {
      fs.promises.unlink(coverImageFilePath);
      fs.promises.unlink(filePath);
    } catch (error) {
      return next(
        createHttpError(500, "Error while deleting files from server")
      );
    }
    // console.log((req as AuthRequest).user);
    const book = await bookModel.create({
      title,
      description,
      coverImage: coverImageUploadResult.secure_url,
      file: fileUploadResult.secure_url,
      author: (req as AuthRequest).user,
      genre,
    });
    return res.json({ book });
  } catch (error) {
    console.log("fileupload", error);
    return next(createHttpError(500, "Error while creating book"));
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookId } = req.params;
    const verifyBook = await bookModel.findById({ _id: bookId });
    if (!verifyBook) {
      return next(createHttpError(404, "Book does not exist"));
    }
    // console.log(String(verifyBook?.author));
    // console.log((req as AuthRequest).user);
    if (String(verifyBook?.author) !== (req as AuthRequest).user) {
      return next(createHttpError(400, "You are not the author of this book"));
    }

    const { title, description, genre } = req.body;
    const { coverImage, file } = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    let coverImageSecureLink = verifyBook?.coverImage;
    let fileSecureLink = verifyBook?.file;
    if (coverImage) {
      const coverImageFileName = coverImage[0].filename;
      const coverImageFilePath = path.resolve(
        __dirname,
        "./../../public/data/uploads",
        coverImageFileName
      );
      try {
        const coverImageUploadResult = await cloudinary.v2.uploader.upload(
          coverImageFilePath,
          {
            filename_override: coverImageFileName,
            resource_type: "image",
            format: coverImage[0].mimetype.split("/").at(-1),
            folder: "cover-image",
          }
        );
        coverImageSecureLink = coverImageUploadResult.secure_url;
        // console.log(coverImageSecureLink);
        const publicId =
          "cover-image/" +
          verifyBook?.coverImage.split("/").at(-1)?.split(".")[0];
        await cloudinary.v2.uploader.destroy(publicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (error) {
        // console.log(error);
        return next(createHttpError(500, "Error while updating cover Image"));
      }
    }
    if (file) {
      const fileName = file[0].filename;
      const filePath = path.resolve(
        __dirname,
        "./../../public/data/uploads",
        fileName
      );
      try {
        const fileUploadResult = await cloudinary.v2.uploader.upload(filePath, {
          resource_type: "raw",
          format: "pdf",
          filename_override: fileName,
          folder: "book-pdfs",
        });
        fileSecureLink = fileUploadResult.secure_url;
        const publicId = "book-pdfs/" + verifyBook?.file.split("/").at(-1);
        await cloudinary.v2.uploader.destroy(publicId, {
          resource_type: "raw",
          invalidate: true,
        });
      } catch (error) {
        return next(createHttpError(500, "Error while updating pdf file"));
      }
    }
    const updateBook = await bookModel.findByIdAndUpdate(
      { _id: bookId },
      {
        $set: {
          title,
          author: (req as AuthRequest).user,
          description,
          genre,
          coverImage: coverImageSecureLink,
          file: fileSecureLink,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).send({
      updateBook,
    });
  } catch (error) {
    next(createHttpError(500, "Something went wrong with update book api"));
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bookId } = req.params;
  console.log(bookId);
  try {
    const bookExist = await bookModel.findById({ _id: bookId });
    if (!bookExist) {
      return next(createHttpError(404, "Book does not exist"));
    }
    if (String(bookExist.author) !== (req as AuthRequest).user) {
      return next(createHttpError(404, "You are not the author"));
    }

    const coverImagePublicId =
      "cover-image/" + bookExist.coverImage.split("/").at(-1)?.split(".")[0];
    await cloudinary.v2.uploader.destroy(coverImagePublicId, {
      resource_type: "image",
      invalidate: true,
    });
    const filePublicId = "book-pdfs/" + bookExist.file.split("/").at(-1);
    await cloudinary.v2.uploader.destroy(filePublicId, {
      resource_type: "raw",
      invalidate: true,
    });
    await bookModel.deleteOne({ _id: bookId });
    return res.status(204).send({ message: "delete" });
  } catch (error) {
    console.log(error);
    next(createHttpError(500, "Something went wrong with delete api"));
  }
};

export const getAllBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const books = await bookModel.find();
    if (!books) {
      return next(createHttpError(404, "No any book available"));
    }
    return res.status(200).json({
      books,
    });
  } catch (error) {
    next(createHttpError(500, "Something went wrong with get all books api"));
  }
};

export const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params;
    const book = await bookModel.findById({ _id: bookId });
    if (!book) {
      return next(createHttpError(404, "Book does not exist"));
    }
    return res.status(200).json({ book });
  } catch (error) {
    next(createHttpError(500, "Something went wrong with get single book api"));
  }
};
