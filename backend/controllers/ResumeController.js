import Resume from "../models/resumeModel.js";
import fs from "fs";
import path from "path";

export const createResume = async (req, res) => {
  try {
    const {title} = req.body;
    //defaul template
    const defaultResumeData = {
      profileInfo: {
        profileImg: null,
        previewUrl: "",
        fullName: "",
        designation: "",
        summary: "",
      },
      contactInfo: {
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      },
      workExperience: [
        {
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      education: [
        {
          degree: "",
          institution: "",
          startDate: "",
          endDate: "",
        },
      ],
      skills: [
        {
          name: "",
          progress: 0,
        },
      ],
      projects: [
        {
          title: "",
          description: "",
          github: "",
          liveDemo: "",
        },
      ],
      certifications: [
        {
          title: "",
          issuer: "",
          year: "",
        },
      ],
      languages: [
        {
          name: "",
          progress: "",
        },
      ],
      interests: [""],
    };
    const newResume = await Resume.create({
        userId: req.user._id,
        title,
        ...defaultResumeData,
        ...req.body
    });
    res.status(201).json(newResume);
  } 
  catch (error) {
    res.status(500).json({ message: "Failed to create resume", error: error.message });
  }
};

//get function
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({userId: req.user._id}).sort({updatedAt: -1});
    res.status(200).json(resumes);
  } 
  catch (error) {
    res.status(500).json({ message: "Failed to get resumes", error: error.message });
  }
};

//get resume by id
export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({_id: req.params.id, userId: req.user._id});
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.status(200).json(resume);
  } 
  catch (error) {
    res.status(500).json({ message: "Failed to get resume", error: error.message });
  }
};

//update resume**
export const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
        _id: req.params.id, 
        userId: req.user._id
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found or not authorized" });
    }
    // Update the resume with the provided data
    Object.assign(resume, req.body);
    //save the updated resume
    const savedResume = await resume.save();
    res.status(200).json(savedResume);
  } 
  catch (error) {
    res.status(500).json({ message: "Failed to update resume", error: error.message });
  }
}

//delete resume
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found or not authorized" });
    }
    //create a uploads folder and store the resume there
    const uploadFolder = path.join(process.cwd(), "uploads");
    //delete thumnail
    if(resume.thumbnail) {
        const oldthumbnail = path.join(uploadFolder, path.basename(resume.thumbnail));
        if(fs.existsSync(oldthumbnail)) {
            fs.unlinkSync(oldthumbnail);
        }
    }
    if(resume.profileInfo?.profilePreviewUrl) {
        const oldProfile = path.join(uploadFolder, path.basename(resume.profileInfo.profilePreviewUrl));
        if(fs.existsSync(oldProfile)) {
            fs.unlinkSync(oldProfile);
        }
    }
    //delete resume document
    const deleted = await Resume.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if(!deleted) {
      return res.status(404).json({ message: "Resume not found or not authorized" });
    }
    res.status(200).json({ message: "Resume deleted successfully" });
  } 
  catch (error) {
    res.status(500).json({ message: "Failed to delete resume", error: error.message });
  }
};
