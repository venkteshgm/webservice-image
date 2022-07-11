const SDC = require('statsd-client');
let metrics = new SDC({port: 8125});

metrics.increment("User.POST.Create_User");
metrics.increment("User.PUT.Update_User");
metrics.increment("User.GET.Get_User_By_Id");

metrics.increment("UserImage.POST.Create_UserImage");
metrics.increment("UserImage.PUT.Update_UserImage");
metrics.increment("UserImage.GET.Get_UserImage");
metrics.increment("UserImage.DELETE.Delete_UserImage");

metrics.increment("HealthCheck.GET.Check_Healthz");

module.exports = metrics;