import Validator from 'validatorjs';

export const Schema = Validator;

Schema.setAttributeFormatter((attribute) => {
  if (attribute.endsWith('_id')) {
    return attribute.replace('_id', '');
  }
  if (attribute.includes('.')) {
    const [parent, child] = attribute.split('.');
    return `${child.replace(/_/g, ' ')} of ${parent.replace(/_/g, ' ')}`;
  }
  return attribute.replace(/_/g, ' ');
});
