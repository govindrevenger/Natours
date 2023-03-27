class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };

    const excludedFeilds = ['page', 'sort', 'limit', 'fields'];

    excludedFeilds.forEach((el) => delete queryObject[el]);

    //1B) Advanced filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
    //here we are doing opertion on tour model one after another so we need previous object to do more operation because we don't want that our previous opreation gone that's why in every function we simply return this at the last so by returning this it means that by returning the whole object
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      //here sort method present on the document of model not on the model
      //for decesnding we can use minus sign in front of argument on which we want to sort so mongoose automatically sort in the decesnding order
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // query = query.sort('createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //And minus is then not including, but excluding
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limits = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limits;
    // console.log(skip, limits);
    //page=3&limit=10,1-10,page 1, 11-20 ,page 2, 21-30 page 3

    this.query = this.query.skip(skip).limit(limits);
    return this;
  }
}

module.exports = APIFeatures;
