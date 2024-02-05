/** File containing all routes for category path
 * @author Michellia G. Herman
 */

const EXPRESS = require("express"); //required express module
const CatCtrl = require("../controller/category-ctrl"); //required the category's controller

/** Express module -
 * @const
 * @type {e | (() => Express)}
 */
const router = EXPRESS.Router();

/** Below route is to serve REST API request developed in Iteration 2 **/
router.post("/api/v1/category/31837409/add", CatCtrl.createCat);
router.get("/api/v1/category/31837409/list", CatCtrl.allCategories);
router.delete("/api/v1/category/31837409/del", CatCtrl.deleteById);
router.put("/api/v1/category/31837409/update", CatCtrl.updateCategory);

/** Below route is to serve HTML pages developed in Iteration 1 **/
router.get("/category/31837409/add", CatCtrl.viewAdd);
router.post("/category/31837409/add-post", CatCtrl.addCat);
router.get("/category/31837409/list", CatCtrl.viewList);
router.get("/category/31837409/del", CatCtrl.viewDelete);
router.post("/category/31837409/del-post", CatCtrl.delCat);
router.get("/category/31837409/search", CatCtrl.listByKeywords);

router.get("/event/31837409/details/:id", CatCtrl.eventDetails);
//Export this module to the file that 'require' it -- the main file
module.exports = router;


