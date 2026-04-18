import { createRouteHandler } from 'uploadthing/h3'
import { ourFileRouter } from '../../utils/uploadthing'

export default createRouteHandler({
  router: ourFileRouter,
  config: {
    token: '<UPLOAD_KEY>',
  },
})
