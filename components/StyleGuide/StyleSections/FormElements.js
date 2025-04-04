import React from "react";

const FormElements = () => {
  return (
    <>
      <div className="wrapper">
        <div className="section-title">
          <h4 className="rbt-title-style-3">Form Elements</h4>
        </div>
        <form
          action="#"
          className="rbt-image-genarator-row rbt-default-form row row--15"
        >
          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
            <div className="form-group">
              <label htmlFor="firstname4">First Name</label>
              <input id="firstname4" type="text" placeholder="First Name" />
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
            <div className="form-group">
              <label htmlFor="lastname4">Last Name</label>
              <input id="lastname4" type="text" placeholder="Last Name" />
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
            <div className="form-group">
              <label htmlFor="username4">User Name</label>
              <input id="username4" type="text" placeholder="User Name" />
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-6 col-12">
            <div className="form-group">
              <label htmlFor="phonenumber4">Phone Number</label>
              <input id="phonenumber4" type="tel" placeholder="Number" />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="bio4">Bio</label>
              <textarea
                id="bio4"
                cols="20"
                rows="5"
                placeholder="Message"
              ></textarea>
            </div>
          </div>
          <div className="col-12 mt--20">
            <div className="form-group mb--0">
              <a className="btn-default" href="#">
                Update Info
              </a>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormElements;
