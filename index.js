const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// -----------------
// Middleware
app.use(cors());
app.use(express.json());

// -----------------
// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oaguo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client Setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// -----------------
// Database & Collection references
let SettingsCollection;
let AppoinmentsCollection;
let ExperienceCollection;
let GalleryCollection;
let CertificatesCollection;
let PublicationsCollection;
let ActivitiesCollection;
let LeadershipCollection;

// -----------------
// Run MongoDB connection
async function run() {
  try {
    await client.connect();

    const db = client.db("Tanzim");

    SettingsCollection = db.collection("settings");
    AppoinmentsCollection = db.collection("appoinments");
    ExperienceCollection = db.collection("experience");
    GalleryCollection = db.collection("gallery");
    CertificatesCollection = db.collection("certificates");
    PublicationsCollection = db.collection("publications");
    ActivitiesCollection = db.collection("activities");
    LeadershipCollection = db.collection("leadership");

    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}
run();
// ------
// main api section starts here --->
// settings related apis----->
app.post("/add_settings", async (req, res) => {
  const data = req.body;
  const result = await SettingsCollection.insertOne(data);
  res.send(result);
});

app.get("/all_settings", async (req, res) => {
  const result = await SettingsCollection.find().sort({ _id: -1 }).toArray();
  res.send(result);
});
// updated settings api
app.patch("/update_settings/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: { ...data },
  };
  const result = await SettingsCollection.updateOne(query, updatedDoc);
  res.send(result);
});
// manage appointments apis------>

app.post("/add_appointment", async (req, res) => {
  const data = req.body;
  const result = await AppoinmentsCollection.insertOne(data);
  res.send(result);
});

app.get("/all_appointments", async (req, res) => {
  const result = await AppoinmentsCollection.find().sort({ _id: -1 }).toArray();
  res.send(result);
});

app.delete("/delete_appointment/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await AppoinmentsCollection.deleteOne(query);
  res.send(result);
});

// main api section ends here --->
// -----------------
// Sample route
app.get("/", (req, res) => {
  res.send("✅ The server is running --- Abu Kalam --- Alhamdulillah!");
});

// -----------------
// Start server
app.listen(port, () => {
  console.log(
    `🚀 Server is running on port ${port} --- Abu Kalam --- Alhamdulillah!`
  );
});
