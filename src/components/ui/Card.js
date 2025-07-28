import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  variant = 'default',
  hover = true,
  padding = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'card';
  const variantClass = `card--${variant}`;
  const hoverClass = hover ? 'card--hover' : '';
  const paddingClass = `card--padding-${padding}`;

  return (
    <div
      className={`${baseClasses} ${variantClass} ${hoverClass} ${paddingClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card__header ${className}`.trim()} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card__body ${className}`.trim()} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card__footer ${className}`.trim()} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;