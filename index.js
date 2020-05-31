const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const axiosInstance = axios.create({
    baseURL: `http://${process.env.OUTPUT_SERVER}:${process.env.OUTPUT_PORT}${process.env.OUTPUT_PATH}`,
});

const inputRouter = express.Router();
app.use(`${process.env.INPUT_PATH}`, inputRouter);

inputRouter.all("/*", (req, res) => {
    let outputPath = req.originalUrl.replace(process.env.INPUT_PATH, process.env.OUTPUT_PATH);

    let outputReq = {
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        outputPath: outputPath,
        outputServer: process.env.OUTPUT_SERVER,
        outputPort: process.env.OUTPUT_PORT,
        outputUrl: `http://${process.env.OUTPUT_SERVER}:${process.env.OUTPUT_PORT}${outputPath}`,
        method: req.method,
        headers: req.headers,
        body: req.body
    };

    let axiosConfig = {
        url: `${outputReq.outputUrl}`,
        method: `${req.method}`,
        headers: req.headers,
        data: req.body,
    };

    axiosInstance(axiosConfig)
        .then((response) => {
            return res.set(response.headers).status(response.status).send(response.data);
        })
        .catch(function (error) {
            if (error.response) {
                return res.set(error.response.headers).status(error.response.status).send(error.response.data);
            } else if (error.request) {
                return res.send(error.request);
            } else if (error.message) {
                return res.send(error.message);
            }
            return res.send(error.config);
        });
});

const port = process.env.INPUT_PORT || 3000;

app.listen(port, () => {
    console.log("Proxy running at port " + port);
});
