const express = require('express');
const Car = require('../models/Car');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create car (only logged-in users)
router.post('/', authMiddleware, async (req, res) => {
  const car = new Car({ ...req.body, createdBy: req.user.id });
  await car.save();
  res.send('Car added');
});

// Get all cars
router.get('/', async (req, res) => {
  const cars = await Car.find();
  res.json(cars);
});

// Get user's cars
router.get('/user', authMiddleware, async (req, res) => {
  const cars = await Car.find({ createdBy: req.user.id });
  res.json(cars);
});

// Update car
router.put('/:id', authMiddleware, async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).send('Not found');
  if (car.createdBy && car.createdBy.toString() !== req.user.id)
    return res.status(403).send('Forbidden');

  await Car.findByIdAndUpdate(req.params.id, req.body);
  res.send('Car updated');
});

// Delete car
router.delete('/:id', authMiddleware, async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).send('Not found');
  if (car.createdBy && car.createdBy.toString() !== req.user.id)
    return res.status(403).send('Forbidden');

  await Car.findByIdAndDelete(req.params.id);
  res.send('Car deleted');
});

module.exports = router;
