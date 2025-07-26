const { Lecture } = require('../models');
const AWS = require('aws-sdk');
const { AWS_CONFIG } = require('../config');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
    region: AWS_CONFIG.region,
});

// CREATE
const create = async (req, res) => {
    const uploadedImages = [];
    let lecture;
    try {
        lecture = await Lecture.create(req.body);
        const subjectId = req.body.subjectId;
        
        for (const file of req.files) {
            const extension = path.extname(file.originalname).toLowerCase();
            const params = {
                Bucket: AWS_CONFIG.bucketName,
                Key: `lectures/${subjectId}/${lecture.id}/images/${Date.now()}${extension}`,
                Body: file.buffer,
            };

            const s3Response = await s3.upload(params).promise();

            uploadedImages.push({
                fileName: file.originalname,
                fileSize: file.size,
                key: s3Response.Key,
                uploadedAt: new Date(),
            });
        }

        lecture.images = uploadedImages;
        await lecture.save();

        res.status(201).json(lecture);
    } catch (err) {
        // Delete uploaded files from S3
        uploadedImages.forEach(async (image) => {
            await s3.deleteObject({
                Bucket: AWS_CONFIG.bucketName,
                Key: image.key,
            }).promise();
        })

        res.status(400).json({ error: err.message });
    }
};

// READ ALL
const getAll = async (req, res) => {
    try {
        const lectures = await Lecture.find()
            .populate('subj_id')
            .populate('stu_id');
        res.json(lectures);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ BY ID
const getById = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id)
            .populate('subj_id')
            .populate('stu_id');
        if (!lecture) return res.status(404).json({ message: 'Not found' });
        res.json(lecture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(lecture);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const remove = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        // Delete associated images from S3
        lecture.images.forEach(async (image) => {
            await s3.deleteObject({
                Bucket: AWS_CONFIG.bucketName,
                Key: image.key,
            }).promise();
        })

        await Lecture.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GENERATE ATTENDANCE
const generateAttendance = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

        // Simulate attendance marking (can add face recognition logic later)
        lecture.present = lecture.gen_images?.length > 0 ? true : false;

        await lecture.save();
        res.json(lecture);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { create, getAll, getById, update, remove, generateAttendance };
