exports.termsConditionGet = async (req, res) => {
   res.render('termsCondition',{ 
    pageTitle: "Terms and Conditions",
    activePage: "termsCondition"   
});
};