import axios from "axios";
import FormData from "form-data";

export async function generateEmbeddings(files) {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file.buffer, file.originalname);
    });

    const apiResponse = await axios.post(
        `${process.env.FACE_RECOGNIZER_SERVICE_URL}/generate-embeddings`,
        formData,
        { headers: formData.getHeaders() }
    );
    return apiResponse;
}

export async function verifyAttendance({ images, studentEmbeddings, subjectId, lectureId }) {
    const formData = new FormData();
    images.forEach((file) => {
        formData.append("images", file.buffer, file.originalname);
    });

    formData.append("studentEmbeddings", JSON.stringify(studentEmbeddings));
    formData.append("subjectId", subjectId);
    formData.append("lectureId", lectureId);

    const apiResponse = await axios.post(
        `${process.env.FACE_RECOGNIZER_SERVICE_URL}/verify-attendance`,
        formData,
        { headers: formData.getHeaders() }
    );

    return apiResponse;
}



// studentEmbeddings = [
//     // Student 1
//     {
//         rollNumber: "",
//         embeddings: [
//             {
//                 image: "423142.jpg",
//                 embedding: []
//             }
//         ]
//     }
//     // Student 2
//     {

//     }
// ]