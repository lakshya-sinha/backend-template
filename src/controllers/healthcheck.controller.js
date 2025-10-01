import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";


//* First way 
/**
 const healthcheck = (req, res, next) => {
  try {
    // const user = getUserFromDB();
    res.status(200).json(
      new ApiResponse(200, { message: "Server is running.." })
    )
  } catch (err) {
    next(err)
  }
}
*/

//* Best Way 

const healthcheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, { message: "Server is Running" })
    )
})




export { healthcheck };