var express = require("express");
var router = express.Router();
var models = require("../models");

// router.get("/", (req, res,next) => {

//   models.materia.findAll({attributes: ["id","nombre","id_carrera"],
      
//       /////////se agrega la asociacion 
//       include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]}],
      
//       include:[{as:'profesor', model:models.profesor, attributes: ["id","nombre","apellido","email"]}]
//       ////////////////////////////////

//     }).then(materias => res.send(materias)).catch(error => { return next(error)});
// });

/**
 * @swagger
 * /materia:
 *   get:
 *     summary: Obtiene todas las materias
 *     tags:
 *       - Materias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Número de página
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: pageSize
 *         in: query
 *         description: Tamaño de página
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 materias:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la materia
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la materia
 *                       id_carrera:
 *                         type: integer
 *                         description: ID de la carrera
 *                       profesor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID de la materia
 *                           nombre:
 *                             type: string
 *                             description: Nombre del profesor
 *                           apellido:
 *                             type: string
 *                             description: Apellido del profesor
 *                           email:
 *                             type: string
 *                             description: Email del profesor
 *                 totalPages:
 *                   type: integer
 *                   description: Número total de páginas
 *       500:
 *         description: Error interno del servidor
 */

router.get("/", (req, res) => {
  
  const pageNum = Number.parseInt(req.query.page);    //verifica que sean numeros evitando el ingreso de texto
  const sizeNum = Number.parseInt(req.query.size);  //verifica que sean numeros evitando el ingreso de texto

  let page = 0;
  if(!Number.isNaN(pageNum) && pageNum > 0){  //valida que sea mayor a cero
    page = pageNum;     //valida que sea mayor a cero y menor a sizeNum, muestra por defecto 3 si no
  }                     // defino ningun page y size

  let size = 3;
  if(!Number.isNaN(sizeNum) && sizeNum > 0  && sizeNum < 11){
    size = sizeNum;   //valida que sea mayor a cero y menor a sizeNum
  }
    
  models.materia.findAndCountAll({
    attributes: ["id","nombre","id_carrera"],
    include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["id","nombre"]}],
    include:[{as:'profesor', model:models.profesor, attributes: ["id","nombre","apellido","email"]}],
    limit: size,
    offset: page * size         //es el valor para el punto de partida del resultado
  })                            // si no esta definido muestra los 3 primero valores
    
    .then(materias => res.send({
        materias: materias.rows,
        totalPages: Math.ceil(materias.count / size) //redondeo al sig numero entero
    }))
    
    .catch(() => res.sendStatus(500));
});

/**
 * @swagger
 * /materia:
 *   post:
 *     summary: Se crea una nueva materia
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la materia
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la materia
 *       400:
 *         description: Solicitud incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       500:
 *         description: Error interno del servidor
 */

router.post("/", (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre,id_carrera:req.body.id_carrera })
    .then(materia => res.status(201).send({ id: materia.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra materia con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findmateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre","id_carrera"],
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

/**
 * @swagger
 * /materia/{id}:
 *   get:
 *     summary: Obtiene la materia identificada con ID  indicado
 *     tags:
 *       - Materias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                       id:
 *                         type: integer
 *                         description: ID de la materia
 *                       nombre:
 *                         type: string
 *                         description: Nombre de la materia
 *                       id_carrera:
 *                         type: integer
 *                         description: ID de la carrera
 *       404:
 *         description: Materia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

router.get("/:id", (req, res) => {
  findmateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

/**
 * @swagger
 * /materia/{id}:
 *   put:
 *     summary: Actualiza materia por su Id
 *     tags:
 *       - Materias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Id de la materia a actualizar
 *         required: true
 *         type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la materia
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Solicitud incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de error
 *       404:
 *         description: Materia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .update({ nombre: req.body.nombre, id_carrera: req.body.id_carrera}, { fields: ["nombre","id_carrera"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

/**
 * @swagger
 * /materia/{id}:
 *   delete:
 *     summary: Elimina materia por su Id
 *     tags: [Materias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Materia no encontrada
 *       500:
 *         description: Error interno del servidor
 */

router.delete("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findmateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
