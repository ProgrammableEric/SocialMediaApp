import React from "react";

import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";

export default ({ children, onClick, btnClassName, tipClassName, tip }) => (
  <Tooltip title={tip} className={tipClassName}>
    <IconButton onClick={onClick} className={btnClassName}>
      {children}
    </IconButton>
  </Tooltip>
);

// Avoiding repeating the same code. Reuse in this way.

/*
<Tooltip title="Edit details" placement="top">
  <IconButton onClick={this.handleOpen} className={classes.button}>
    <EditIcon color="primary" />
  </IconButton>
</Tooltip>
        
*/
