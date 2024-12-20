

import express, { json } from 'express'; 
//const path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 10000;

// Serve static files (bundles)

// Log all incoming requests
app.use('/',(req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next(); // Pass the request to the next middleware or route handler
  });





app.use('/codepush', express.static(path.join(__dirname, 'bundles')));

// Endpoint to check for updates
app.get('/checkForUpdate', (req, res) => {
    
  const version = req.query.version;
  console.log(req);
  // Compare with the current version (could be a version stored in your DB)
  const latestVersion = '1.0.1'; // Example

  // If version is outdated, send the update info (for example, bundle URL)
  if (1 == 1) {
    res.json({
      updateAvailable: true,
      bundleUrl: 'http://localhost:3000/codepush/myApp.bundle.js',
      mandatory: true, // If true, update must be applied
    });
  } else {
    res.json({ updateAvailable: false,version:version});
  }
});

// POST endpoint to release an update
app.post('/api/apps/:appName/release', (req, res) => {
    const { appName } = req.params;
    const { deploymentKey, version, bundle } = req.body;
  
    // Store deployment metadata in Lowdb
    const release = {
      appName,
      deploymentKey,
      version,
      bundle,
      date: new Date().toISOString()
    };
  
    db.get('deployments')
      .push(release)
      .write();
  
    res.status(201).json({ message: 'Release successful' });
  });
  
  // GET endpoint to fetch deployments
  app.get('/api/apps/:appName/deployments', (req, res) => {
    const { appName } = req.params;
  
    // Get deployments for the app
    const deployments = db.get('deployments')
      .filter({ appName })
      .value();
  
    res.status(200).json(deployments);
  });
  

  // download file code

  app.get('/download', (req, res) => {
    // Define the file path
    const filePath = path.join(__dirname, '/src/assets/files/test.js'); // Replace with your file path
    const fileName = 'test.js'; // Define the name for download
    
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File not found:', err);
        return res.status(404).send('File not found');
      }
  
      // Set headers to prompt download
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/octet-stream');
  
      // Pipe the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
  
      fileStream.on('error', (streamErr) => {
        console.error('Error reading file:', streamErr);
        res.status(500).send('Error reading file');
      });
    });
  });

  // Serve the bundle file
app.get('/myapp/index.android.bundle', (req, res) => {
    //console.log(req);
    res.sendFile(path.join(__dirname, '/src/assets/files/index.android.bundle'));
  });

  // POST endpoint to handle CodePush deployment status reports
app.post('/v0.1/public/codepush/report_status/deploy', (req, res) => {
 const { deploymentKey, status, message, failedPackages, durationInMilliseconds, deviceCount } = req.body;

  // Validate incoming data (basic example)
  if (!deploymentKey || !status || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Process deployment status
  // Here, you can save the report to a database, send notifications, etc.
  console.log(`Deployment Key: ${deploymentKey}`);
  console.log(`Status: ${status}`);
  console.log(`Message: ${message}`);
  console.log(`Failed Packages: ${JSON.stringify(failedPackages)}`);
  console.log(`Duration: ${durationInMilliseconds} ms`);
  console.log(`Devices Count: ${deviceCount}`);

  console.log("Request",req);

  // Send response back to acknowledge receipt of the status report
  res.status(200).json({ message: "Deployment status reported successfully" });
});


// Example in-memory "updates" for simplicity
const updates = {
  "ytW0YThs0ppXusp5EM819hTcuo5WU0doy3FRpZ": {
    "platform": "android",
    "appVersion": "1.0.0",
    "newVersion": "1.1.0",
    "description": "Bug fixes and performance improvements.",
    "packageHash": "abcd1234",
    "isMandatory": false
  }
};

app.get('/v0.1/public/codepush/update_check', (req, res) => {
  // const { deploymentKey, appVersion, platform } = req.query;

  // if (!deploymentKey || !appVersion || !platform) {
  //   return res.status(400).json({ error: 'Missing required query parameters.' });
  // }

  // // Check for the existence of the deployment
   const updateInfo = updates["ytW0YThs0ppXusp5EM819hTcuo5WU0doy3FRpZ"];

  // if (!updateInfo || updateInfo.platform !== platform || updateInfo.appVersion === appVersion) {
  //   return res.json({ isAvailable: false });
  // }

  // Return update info if available
  return res.json({
    isAvailable: true,
    update: {
      appVersion: updateInfo.newVersion,
      description: updateInfo.description,
      packageHash: updateInfo.packageHash,
      isMandatory: updateInfo.isMandatory,
      deploymentKey: "ytW0YThs0ppXusp5EM819hTcuo5WU0doy3FRpZ"
    }
  });
});




app.listen(process.env.PORT, () => {
  console.log("listening");
});

/*
app.listen(port, () => {
  console.log(`CodePush server running at http://localhost:${port}`);
});

*/
