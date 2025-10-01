
exports.aboutget = async (req, res) => {
   res.render('Aboutme',{ 
    pageTitle: "About Me",
    activePage: "Aboutme",
    isLoggedIn: req.session.isLoggedIn,
});
};
