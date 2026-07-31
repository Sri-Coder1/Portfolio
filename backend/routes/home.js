const router = require("express").Router();
const Project = require("../models/Project");
const ContentItem = require("../models/ContentItem");

function serialize(item) {
  if (!item) return null;
  const id = item._id.toString();
  // Return a plain object without the Mongoose-specific properties
  return { ...item, id };
}

router.get("/", async (req, res) => {
  try {
    const [
      profile,
      projects,
      hackathons,
      activities,
      workExperience
    ] = await Promise.all([
      // Profile: Get the most recently updated one
      ContentItem.find({ type: "profile" }).sort({ updatedAt: -1 }).limit(1).lean(),

      // Projects: Sorted by creation date
      Project.find().sort({ createdAt: 1 }).lean(),

      // Other content: Sorted by user-defined order, then creation date
      ContentItem.find({ type: "hackathon" }).sort({ sort_order: 1, createdAt: 1 }).lean(),
      ContentItem.find({ type: "activity" }).sort({ sort_order: 1, createdAt: 1 }).lean(),
      ContentItem.find({ type: "work-experience" }).sort({ sort_order: 1, createdAt: 1 }).lean()
    ]);

    // The `lean()` method returns plain JS objects, so we just need to add the string `id`.
    const serializeArray = (arr) => arr.map(item => ({ ...item, id: item._id.toString() }));

    res.json({
      profile: serializeArray(profile),
      projects: serializeArray(projects),
      hackathons: serializeArray(hackathons),
      activities: serializeArray(activities),
      workExperience: serializeArray(workExperience)
    });

  } catch (err) {
    console.error("Homepage data fetch failed:", err);
    res.status(500).json({
      message: "Failed to load homepage data.",
      // Send empty arrays on error to prevent frontend from crashing
      profile: [],
      projects: [],
      hackathons: [],
      activities: [],
      workExperience: []
    });
  }
});

module.exports = router;