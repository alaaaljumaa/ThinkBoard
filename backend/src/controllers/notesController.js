import Note from "../models/Note.js";

const getAllNotes = async (_, res) => {
  try {
    const notes = await Note.find().sort({createdAt: -1}); // ترتيب الملاحظات حسب تاريخ الإنشاء من الأحدث إلى الأقدم
    res.status(200).json({ message: "Notes retrieved successfully", notes });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve notes", error: error.message });
  }
};
const createNote = async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();
    res.status(201).json({ message: "Note created successfully", note });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create note", error: error.message });
  }
};
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note retrieved successfully", note });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    res.status(500).json({
      message: "Failed to retrieve note",
      error: error.message,
    });
  }}
const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!note){
        res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note updated successfully", note });
   
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update note", error: error.message });
  }
};
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
     if(!note){
        res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully", note });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete note", error: error.message });
  }
};

export { getAllNotes,getNoteById, createNote, updateNote, deleteNote };
