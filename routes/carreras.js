var express = require("express");
var router = express.Router();
var models = require("../models");


router.get("/", (req, res) => {
  
  const pageNum = Number.parseInt(req.query.page);    //verifica que sean numeros evitando el ingreso de texto
  const sizeNum = Number.parseInt(req.query.size);  //verifica que sean numeros evitando el ingreso de texto

  let page = 0;
  if(!Number.isNaN(pageNum) && pageNum > 0){  //valida que sea mayor a cero
    page = pageNum;
  }

  let size = 11;
  if(!Number.isNaN(sizeNum) && sizeNum > 0  && sizeNum < 11){
    size = sizeNum;   //valida que sea mayor a cero y menor a sizeNum, muestra por defecto 2 si no
  }                   // defino ningun page y size  
    
  models.carrera.findAndCountAll({
    attributes: ["id", "nombre","id_facultad"],
    include:[{as:'Facultad-Relacionada', model:models.facultad, attributes: ["id","nombre"]}],
    limit: size,
    offset: page * size           //es el valor para el punto de partida del resultado
  })                              // si no esta definido muestra los 2 primero valores 
    
    .then(carreras => res.send({
        carreras: carreras.rows,
        totalPages: Math.ceil(carreras.count / size)    //redondeo al sig numero entero
    }))
    
    .catch(() => res.sendStatus(500));
});

// router.get("/", (req, res) => {
  
//   console.log("Esto es un mensaje para ver en consola");
//   models.carrera.findAll({attributes: ["id", "nombre","id_facultad"],
//   ////////se agrega la asociacion 
//     include:[{as:'Facultad-Relacionada', model:models.facultad, attributes: ["id","nombre"]}]
//      ////////////////////////////////
//   })
//     .then(carreras => res.send(carreras))
//     .catch(() => res.sendStatus(500));
// });

router.post("/", (req, res) => {
  models.carrera
    .create({ nombre: req.body.nombre , id_facultad: req.body.id_facultad })
    .then(carrera => res.status(201).send({ id: carrera.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre","id_facultad"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .update({ nombre: req.body.nombre },{ fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = carrera =>
    carrera
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
