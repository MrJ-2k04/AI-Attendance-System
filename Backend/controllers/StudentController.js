import { Student } from '../models/index.js';
import AWS from 'aws-sdk';
import { AWS_CONFIG } from '../config.js';
import ResponseHandler from '../utils/ResponseHandler.js';
import path from 'path';

// Configure AWS S3
const s3 = new AWS.S3({
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
    region: AWS_CONFIG.region,
});

// CREATE
const create = async (req, res) => {
    const uploadedImages = [];
    try {

        for (const file of req.files) {
            const extension = path.extname(file.originalname).toLowerCase();
            const params = {
                Bucket: AWS_CONFIG.bucketName,
                Key: `students/${req.body.rollNumber}/${Date.now()}${extension}`,
                Body: file.buffer,
            };

            const s3Response = await s3.upload(params).promise();

            uploadedImages.push({
                fileName: file.originalname,
                fileSize: file.size,
                key: s3Response.Key,
                url: s3Response.Location,
                uploadedAt: new Date(),
            });
        }

        const studentData = {
            ...req.body,
            images: uploadedImages,
        };

        const student = await Student.create(studentData);
        res.status(201).json(student);
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
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// READ BY ID
const getById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
const update = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE
const remove = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Delete associated images from S3
        student.images.forEach(async (image) => {
            await s3.deleteObject({
                Bucket: AWS_CONFIG.bucketName,
                Key: image.key,
            }).promise();
        })

        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default { create, getAll, getById, update, remove };
