/**
 * Created by Gyurasits Zoltán on 2017.02.01..
 */


F.isAdmin = function(steamid) {
        if(F.config['adminids'].indexOf(steamid) > -1) {
            return true;
        }
        return false;
}

F.isModerator = function(steamid) {
    if(F.config['moderatorids'].indexOf(steamid) > -1) {
        return true;
    }
    return false;
}
