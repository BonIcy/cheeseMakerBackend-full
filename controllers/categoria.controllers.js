const { response } = require('express');
const Categoria  = require('../models/Categoria.js');  

const postCategoria = async (req, res) => {
    const nombre = req.body.nombre.toUpperCase();

    const categoriaDB = await Categoria.findOne({ nombre });

    if (categoriaDB) {
        return res.status(400).json({
            msg: `La categoria ${categoriaDB.nombre}, ya existe`
        });
    }

    const data = {
        nombre,
        usuario: req.usuario._id
    }
    const categoria = new Categoria(data);
    try {
        await categoria.save();
        const categoriaGuardada = await Categoria.findById(categoria._id)
            .populate('usuario', ['nombre', 'email']);
        res.status(201).json(categoriaGuardada);
    } catch (error) {
        res.status(500).json({
            msg: 'Hubo un error al crear la categoría'
        });
    }
}

const getCategorias = async(req, res = response ) => {

    const { hasta = 8, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, categorias ] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            .populate('usuario', ['nombre', 'email'])
            .skip( Number( desde ) )
            .limit(Number( hasta ))
    ]);

    res.json({
        total,
        categorias
    });
}

const getCategoria = async(req, res = response ) => {

    const { id } = req.params;
    const categoria = await Categoria.findById( id )
                            .populate('usuario', 'nombre');

    res.json( categoria );

}

const putCategoria = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    data.nombre  = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true });

    res.json( categoria );

}

const delCategoria = async(req, res =response ) => {

    const { id } = req.params;
    const categoriaEliminada = await Categoria.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( categoriaEliminada );
}

module.exports = {
    postCategoria,
    getCategorias,
    getCategoria,
    putCategoria,
    delCategoria
}

