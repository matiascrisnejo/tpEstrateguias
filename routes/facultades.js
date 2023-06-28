var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.facultad
    .findAll({
      attributes: ["id", "nombre"],
      include:[{as:'carrera', model:models.carrera, attributes: ["id","nombre"]}]
    })
    .then(facultades => res.send(facultades))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.facultad
    .create({ nombre: req.body.nombre })
    .then(facultad => res.status(201).send({ id: facultad.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra facultad con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findFacultad = (id, { onSuccess, onNotFound, onError }) => {
  models.facultad
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(facultad => (facultad ? onSuccess(facultad) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findFacultad(req.params.id, {
    onSuccess: facultad => res.send(facultad),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = facultad =>
  facultad
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra facultad con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findFacultad(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = facultad =>
  facultad
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findFacultad(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
