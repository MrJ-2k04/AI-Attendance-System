
// Imports
// const auth = require("../middlewares/auth");
// const admin = require('../middlewares/admin');
const teacherRoutes = require("./Teacher.routes");
const subjectRoutes = require("./Subject.routes");
const studentRoutes = require("./Student.routes");
const lectureRoutes = require("./Lecture.routes");


module.exports = function (app) {
  const router = require("express").Router();
  app.use(router);

  router.get("/", (req, res) => res.status(200).json({ type: "success", message: "Server is running" }));

  router.use("/teacher", teacherRoutes);
  router.use("/subject", subjectRoutes);
  router.use("/student", studentRoutes);
  router.use("/lecture", lectureRoutes);

  // 404 not found
  router.get("/*", (req, res) => res.status(404).json({ type: 'error', message: '404 not found!' }));
}