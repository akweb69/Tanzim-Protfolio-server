const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || "*" })); // Restrict CORS in production
app.use(express.json());

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

let db; // Global DB reference

// Run MongoDB connection
async function run() {
  try {
    await client.connect();
    db = client.db("Tanzim");
    console.log("✅ Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process if DB connection fails
  }
}

// Start server only after DB connection
async function startServer() {
  try {
    await run();
    app.listen(port, () => {
      console.log(
        `✅ Server is running on port ${port} --- Abu Kalam --- Alhamdulillah!`
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Sample route
app.get("/", (req, res) => {
  res.send("✅ The server is running --- Abu Kalam --- Alhamdulillah!");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received. Closing MongoDB connection...");
  await client.close();
  process.exit(0);
});

// Example route using MongoDB
// hero section
app.patch("/update-hero-section/:id", async (req, res) => {
  try {
    const { _id, ...rest } = req.body;
    const id = req.params.id;

    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { ...rest },
    };

    const result = await db
      .collection("heroSection")
      .updateOne(query, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

app.get("/hero-section", async (req, res) => {
  const cursor = db.collection("heroSection").find();
  const result = await cursor.toArray();
  res.send(result);
});
// hero section ends
// about section
app.patch("/update-about-section/:id", async (req, res) => {
  try {
    const { _id, ...rest } = req.body;
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { ...rest },
    };
    const result = await db
      .collection("aboutSection")
      .updateOne(query, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

app.get("/about-section", async (req, res) => {
  const cursor = db.collection("aboutSection").find();
  const result = await cursor.toArray();
  res.send(result);
});
//! about section ends
// skills section
app.post("/add-skills", async (req, res) => {
  const skills = req.body;
  const result = await db.collection("skillsSection").insertOne(skills);
  res.send(result);
});
app.patch("/update-skill/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { ...data },
  };
  const result = await db
    .collection("skillsSection")
    .updateOne(query, updateDoc);
  res.send(result);
});

app.get("/skills", async (req, res) => {
  const cursor = db.collection("skillsSection").find();
  const result = await cursor.toArray();
  res.send(result);
});
app.delete("/delete-skill/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await db.collection("skillsSection").deleteOne(query);
  res.send(result);
});
// skills sections end
// eduction sections start---->
// POST: Create a new education entry
app.post("/educations", async (req, res) => {
  try {
    const education = req.body;

    // Basic validation
    if (
      !education.degreeName ||
      !education.instituteName ||
      !education.passingYear
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: degreeName, instituteName, or passingYear",
      });
    }

    const result = await db.collection("education").insertOne(education);
    res.status(201).json({
      message: "Education created successfully",
      educationId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Retrieve all education entries
app.get("/educations", async (req, res) => {
  try {
    const cursor = db.collection("education").find();
    const educations = await cursor.toArray();
    res.status(200).json(educations);
  } catch (error) {
    console.error("Error fetching educations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH: Update an education entry by ID
app.patch("/educations/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid education ID" });
    }

    const query = { _id: new ObjectId(id) };
    const updateDoc = { $set: data };
    const result = await db.collection("education").updateOne(query, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Education not found" });
    }

    res.status(200).json({ message: "Education updated successfully" });
  } catch (error) {
    console.error("Error updating education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE: Delete an education entry by ID
app.delete("/educations/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid education ID" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await db.collection("education").deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Education not found" });
    }

    res.status(200).json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//! publications start --->
app.post("/publications", async (req, res) => {
  const data = req.body;
  const result = await db.collection("publications").insertOne(data);
  res.send(result);
});
app.get("/publications", async (req, res) => {
  const cursor = db.collection("publications").find();
  const result = await cursor.sort({ _id: -1 }).toArray();
  res.send(result);
});
app.patch("/publications/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const query = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: { ...data },
  };
  const result = await db
    .collection("publications")
    .updateOne(query, updateDoc);
  res.send(result);
});
app.delete("/publications/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await db.collection("publications").deleteOne(query);
  res.send(result);
});
//! training start --->
app.post("/trainings", async (req, res) => {
  const data = req.body;
  const result = await db.collection("trainings").insertOne(data);
  res.send(result);
});
app.get("/trainings", async (req, res) => {
  const cursor = db.collection("trainings").find();
  const result = await cursor.sort({ _id: -1 }).toArray();
  res.send(result);
});
app.patch("/trainings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid training ID" });
    }

    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        ...data,
        updatedAt: new Date(), // Add timestamp
      },
    };

    const result = await db.collection("trainings").updateOne(query, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Training not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating training:", error);
    res.status(500).json({ error: "Failed to update training" });
  }
});

app.delete("/trainings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid training ID" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await db.collection("trainings").deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Training not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error deleting training:", error);
    res.status(500).json({ error: "Failed to delete training" });
  }
});
// Activities--->
app.post("/activity", async (req, res) => {
  const data = req.body;
  const result = await db.collection("activity").insertOne(data);
  res.send(result);
});
app.get("/activity", async (req, res) => {
  const cursor = db.collection("activity").find();
  const result = await cursor.sort({ _id: -1 }).toArray();
  res.send(result);
});
app.patch("/activity/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }

    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    };

    const result = await db.collection("activity").updateOne(query, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "activity not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Failed to update activity" });
  }
});
app.delete("/activity/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid training ID" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await db.collection("activity").deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ error: "Failed to delete activity" });
  }
});
// experience section
app.post("/add-experience", async (req, res) => {
  const experience = req.body;
  const result = await db.collection("experienceSection").insertOne(experience);
  res.send(result);
});
app.patch("/update-experience/:id", async (req, res) => {
  const id = req.params.id;
  const { _id, ...rest } = req.body;
  const updatedExperience = { ...rest };

  try {
    const result = await db
      .collection("experienceSection")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedExperience });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ error: "Failed to update experience" });
  }
});
app.get("/experience", async (req, res) => {
  const cursor = db.collection("experienceSection").find();
  const result = await cursor.toArray();
  res.send(result);
});
app.delete("/delete-experience/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await db.collection("experienceSection").deleteOne(query);
  res.send(result);
});

// appoinment sections===>
app.post("/appointments", async (req, res) => {
  const appointment = req.body;
  const result = await db.collection("appointments").insertOne(appointment);
  res.send(result);
});

app.get("/appointments", async (req, res) => {
  const cursor = db.collection("appointments").find();
  const result = await cursor.toArray();
  res.send(result);
});
// for gellery sections
app.post("/gallery", async (req, res) => {
  const data = req.body;
  const result = await db.collection("gallery").insertOne(data);
  res.send(result);
});
app.get("/gallery", async (req, res) => {
  const cursor = db.collection("gallery").find();
  const result = await cursor.sort({ _id: -1 }).toArray();
  res.send(result);
});
app.delete("/gallery/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await db.collection("gallery").deleteOne(query);
  res.send(result);
});
// for references sections
app.post("/references", async (req, res) => {
  const data = req.body;
  const result = await db.collection("references").insertOne(data);
  res.send(result);
});
app.get("/references", async (req, res) => {
  const cursor = db.collection("references").find();
  const result = await cursor.sort({ _id: -1 }).toArray();
  res.send(result);
});
app.delete("/references/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await db.collection("references").deleteOne(query);
  res.send(result);
});
// end of references
// settings--->
app.get("/settings", async (req, res) => {
  const cursor = db.collection("settings").find().sort({ _id: -1 });
  const result = await cursor.toArray();
  res.send(result);
});
app.post("/settings", async (req, res) => {
  const data = req.body;
  const result = await db.collection("settings").insertOne(data);
  res.send(result);
});
