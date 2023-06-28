'use strict';
module.exports = (sequelize, DataTypes) => {
  const facultad = sequelize.define('facultad', {
    nombre: DataTypes.STRING
  }, {});
  
  facultad.associate = function(models) {
    // codigo de asociaacion (tiene muchos:)
    facultad.hasMany(models.carrera,
      {
        as: 'carrera',
        foreignKey: 'id_facultad'
      })
      
  };
  return facultad;
};