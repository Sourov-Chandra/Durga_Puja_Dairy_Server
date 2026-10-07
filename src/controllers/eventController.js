import { Event } from "../models/Event.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getMandapEvents = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const events = await Event.find({ mandapId })
      .sort({ date: 1, startTime: 1 })
      .lean();
    return sendSuccess(res, events, "Events loaded");
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueOrStage,
      performers,
      coverImage,
    } = req.body;

    if (!title || !date || !startTime) {
      return sendError(res, "Title, date, and startTime are required.", 400);
    }

    const event = await Event.create({
      mandapId,
      title,
      description: description || "",
      category: category || "CULTURAL_PROGRAM",
      date: new Date(date),
      startTime,
      endTime: endTime || "",
      venueOrStage: venueOrStage || "Mandap Premises",
      performers: performers || "",
      coverImage: coverImage || { url: "", publicId: "" },
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "EVENT_CREATED",
      details: { title: event.title, category: event.category },
    });

    return sendSuccess(res, event, "Cultural event added", 201);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, "Event not found.", 404);
    }

    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueOrStage,
      performers,
      coverImage,
      status,
    } = req.body;

    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (category) event.category = category;
    if (date) event.date = new Date(date);
    if (startTime) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (venueOrStage !== undefined) event.venueOrStage = venueOrStage;
    if (performers !== undefined) event.performers = performers;
    if (coverImage) event.coverImage = coverImage;
    if (status) event.status = status;

    await event.save();

    return sendSuccess(res, event, "Event updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return sendError(res, "Event not found.", 404);
    }
    return sendSuccess(res, null, "Event deleted successfully");
  } catch (error) {
    next(error);
  }
};
