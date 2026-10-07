import { Schedule } from "../models/Schedule.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getMandapSchedules = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const schedules = await Schedule.find({ mandapId })
      .sort({ date: 1, order: 1 })
      .lean();
    return sendSuccess(res, schedules, "Schedules loaded");
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { mandapId } = req.params;
    const { day, title, description, date, startTime, endTime, priestName, order } =
      req.body;

    if (!day || !title || !date || !startTime) {
      return sendError(
        res,
        "Day, title, date, and startTime are required.",
        400
      );
    }

    const schedule = await Schedule.create({
      mandapId,
      day,
      title,
      description: description || "",
      date: new Date(date),
      startTime,
      endTime: endTime || "",
      priestName: priestName || "",
      order: order !== undefined ? parseInt(order, 10) : 0,
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      mandapId,
      action: "SCHEDULE_CREATED",
      details: { title: schedule.title, day: schedule.day },
    });

    return sendSuccess(res, schedule, "Schedule ritual added", 201);
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return sendError(res, "Schedule ritual not found.", 404);
    }

    const { day, title, description, date, startTime, endTime, priestName, order } =
      req.body;

    if (day) schedule.day = day;
    if (title) schedule.title = title;
    if (description !== undefined) schedule.description = description;
    if (date) schedule.date = new Date(date);
    if (startTime) schedule.startTime = startTime;
    if (endTime !== undefined) schedule.endTime = endTime;
    if (priestName !== undefined) schedule.priestName = priestName;
    if (order !== undefined) schedule.order = parseInt(order, 10);

    await schedule.save();

    return sendSuccess(res, schedule, "Schedule updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findByIdAndDelete(scheduleId);
    if (!schedule) {
      return sendError(res, "Schedule ritual not found.", 404);
    }
    return sendSuccess(res, null, "Schedule ritual deleted");
  } catch (error) {
    next(error);
  }
};
