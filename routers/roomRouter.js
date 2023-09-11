import { Router } from 'express';

import RoomController from '../controllers/RoomController.js';
 
const roomRouter = Router();

roomRouter.post('/create', RoomController.create)
roomRouter.get('/:roomID', RoomController.findRoom)

export default roomRouter;