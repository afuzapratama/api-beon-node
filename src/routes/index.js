const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// Geolocation
router.get('/geolocation', apiController.getGeolocation);

// User Agent
router.get('/user_agent', apiController.getUserAgent);

// Bounce / Email
router.get('/bounce', apiController.verifyEmail);

// Postal
router.get('/postal/jp', apiController.getPostalJp);

// Domain
router.get('/domain', apiController.checkDomain);
router.get('/domain/analyze', apiController.analyzeDomain);

// Blockers / Crawler
router.get('/blockers/crawler', apiController.checkCrawler);

// Blockers / Quality (IPQS)
router.get('/blockers', apiController.checkIpQuality);

// Card
router.get('/card/validate', apiController.validateCard);

// BIN Lookup
router.get('/bin', apiController.getBinLookup);

module.exports = router;
