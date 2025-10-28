const carinfo = require('../models/carinfo');

exports.deleteCar = async (req, res) => {
    try {
        if (!req.session.user) return res.status(401).send("Unauthorized");

        const carId = req.params.id;
        const userId = req.session.user._id; 

        const deleted = await carinfo.deleteOne({ _id: carId, userId });

        if (deleted.deletedCount === 0) return res.status(404).send("Car not found or not yours");

        res.sendStatus(200); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting car");
    }
};
