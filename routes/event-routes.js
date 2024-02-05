/** File containing all routes for event path
 * @author Devesh Gurusinghe
 */

const EXPRESS = require("express");
const EveCtrl = require("../controller/event-ctrl");

/** Express module -
 * @const
 * @type {e | (() => Express)}
 */
const router = EXPRESS.Router();

router.post("/add", EveCtrl.createEve);
router.get("/list-json", EveCtrl.allEvents);
router.delete("/del", EveCtrl.deleteById);
router.put("/api/v1/event/32818866/update", EveCtrl.updateEvent);

router.get("/add", EveCtrl.viewAdd);
router.get("/category-details/:id",EveCtrl.catDetails);

router.get("/list", EveCtrl.viewList);
router.get("/list-sold", EveCtrl.viewSoldList);
router.get("/del", EveCtrl.deleteById);
router.get("/view/:id", EveCtrl.viewById);

router.post("/add-event", EveCtrl.createEveApi);

module.exports = router;
